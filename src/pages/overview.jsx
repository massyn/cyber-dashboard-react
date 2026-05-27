import React, { useEffect, useState } from 'react';
import ChartLine from '../components/ChartLine';
import Filters from '../components/Filters';
import GraphContainer from '../components/GraphContainer';
import { fetchAndExtractCSV } from '../utils/fetchData';
import { weightedCalculation } from '../utils/weightedCalculations';
import '../style.css';

const extractLatest = (data, dimensionKey) => {
  if (!data || data.length === 0) return { labels: [], values: [] };
  const latest = data.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
  const rows = data
    .filter(r => r.datestamp === latest)
    .sort((a, b) => a.value - b.value);
  return {
    labels: rows.map(r => r[dimensionKey]),
    values: rows.map(r => parseFloat((r.value * 100).toFixed(1))),
  };
};

const HorizontalBar = ({ title, labels, values }) => {
  if (labels.length === 0) return null;
  return (
    <GraphContainer title={title}>
      <div style={{ padding: '8px 0' }}>
        {labels.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ width: '130px', textAlign: 'right', paddingRight: '10px', fontSize: '13px', flexShrink: 0, color: '#333' }}>
              {label}
            </div>
            <div style={{ flex: 1, backgroundColor: '#e0e8f0', borderRadius: '4px', height: '28px', position: 'relative' }}>
              <div style={{
                width: `${values[i]}%`,
                backgroundColor: '#1565c0',
                height: '100%',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8px',
                minWidth: '44px',
              }}>
                <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>
                  {values[i]?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GraphContainer>
  );
};

const Overview = () => {
  const [rawData,          setRawData]          = useState(null);
  const [selected_filters, setSelected_filters] = useState('');
  const [orgTrend,         setOrgTrend]         = useState(null);
  const [buLatest,         setBuLatest]         = useState({ labels: [], values: [] });
  const [catLatest,        setCatLatest]        = useState({ labels: [], values: [] });

  useEffect(() => {
    const init = async () => {
      try {
        const { rawData: data } = await fetchAndExtractCSV('/summary.csv');
        setRawData(data);
        compute(data, {});
      } catch (error) {
        console.error('Error initialising data:', error);
      }
    };
    init();
  }, []);

  const compute = (data, filters) => {
    setOrgTrend(weightedCalculation(data, filters));
    setBuLatest(extractLatest(weightedCalculation(data, filters, 'business_unit'), 'business_unit'));
    setCatLatest(extractLatest(weightedCalculation(data, filters, 'category'), 'category'));
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    const updated = { ...selected_filters, [name]: value };
    setSelected_filters(updated);
    if (rawData) compute(rawData, updated);
  };

  if (!orgTrend || !rawData) {
    return (
      <div className="spinner-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="mt-3 text-dark">Please wait while the data is loading...</h3>
          <p className="text-muted">This may take a moment depending on the size of your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="my-4">Overview</h1>
      <div className="row">
        <div className="col-md-3">
          <Filters
            data={rawData}
            onChange={handleDropdownChange}
            filters={selected_filters}
          />
        </div>

        <div className="col-md-9">
          <ChartLine
            id="orgScore"
            title="Organisational score over time"
            data={orgTrend}
            x="datestamp"
            y={['value', 'slo', 'slo_min']}
            custom={{
              value:   { label: 'Score', showMark: true },
              slo:     { color: 'green',  label: 'Target'  },
              slo_min: { color: 'yellow', label: 'SLO min' },
            }}
          />

          <div className="row">
            <div className="col-md-6">
              <HorizontalBar
                title="Business Units"
                labels={buLatest.labels}
                values={buLatest.values}
              />
            </div>
            <div className="col-md-6">
              <HorizontalBar
                title="Categories"
                labels={catLatest.labels}
                values={catLatest.values}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
