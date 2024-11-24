import React, { useEffect, useState } from 'react';

import ChartLine from '../components/ChartLine';
import Filters from '../components/Filters';

import { fetchAndExtractCSV } from '../utils/fetchData';
import { filterData, pivotData } from '../utils/processData';
import { calculateChartDimension } from '../utils/calculateChartDimension';

import '../style.css';

export const calculateChart = (data, filters = {}) => {
  const filteredData = filterData(data,filters);  // Apply filters

  // pivot the first layer
  const chart1_pivotData = pivotData(filteredData, ['datestamp', 'metric_id'], {
    sum_total:   [ 'sum', 'total'   ],
    sum_totalok: [ 'sum', 'totalok' ],
    weight:      [ 'avg', 'weight'  ],
    slo:         [ 'avg', 'slo'     ],
    slo_min:     [ 'avg', 'slo_min' ]
  });
  
  const chart1_weights = pivotData(chart1_pivotData, ['datestamp'], {
    sum_weight: ['sum', 'weight'],
  });
  const chart1_weightsLookup = Object.fromEntries(
    chart1_weights.map((item) => [item.datestamp, item.sum_weight])
  );

  const chart1_pivotData_calculated = chart1_pivotData.map((item) => ({
    ...item,
    score_weighted:   item.sum_total ? (item.sum_totalok / item.sum_total) * item.weight : 0,
    slo_weighted:     item.slo * item.weight,
    slo_min_weighted: item.slo_min * item.weight,
    weighted_sum:     chart1_weightsLookup[item.datestamp] || 0,
  }));
  
  const chart1_pivotData_calculated2 = pivotData(chart1_pivotData_calculated, ['datestamp'], {
    score_weighted_total: [ 'sum', 'score_weighted'   ],
    weighted_sum_total:   [ 'avg', 'weighted_sum'     ],
    weighted_slo:         [ 'sum', 'slo_weighted'     ],
    weighted_slo_min:     [ 'sum', 'slo_min_weighted' ]
  });

  const chart1_pivotData_calculated3 = chart1_pivotData_calculated2.map((item) => ({
    ...item,
    value:    item.weighted_sum_total ? item.score_weighted_total / item.weighted_sum_total : 0,
    slo:      item.weighted_slo       ? item.weighted_slo         / item.weighted_sum_total : 0,
    slo_min:  item.weighted_slo_min   ? item.weighted_slo_min     / item.weighted_sum_total : 0,
  }));
  
  return chart1_pivotData_calculated3
};

const Overview = () => {
  const [rawData, setRawData] = useState(null);
  const [selected_filters, setSelected_filters] = useState('');
  const [chart1_filteredData, setChart1_filteredData] = useState(null);
  const [chart2_filteredData, setChart2_filteredData] = useState(null);

  // Download the raw data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchAndExtractCSV('/summary.csv');
        setRawData(data.rawData);

        const chart1_aggregatedData = calculateChart(data.rawData);
        setChart1_filteredData(chart1_aggregatedData);

        const chart2_aggregatedData = calculateChartDimension(data.rawData, {}, 'business_unit');
        setChart2_filteredData(chart2_aggregatedData);

      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
  }, []);

  // handle the dropdown
  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    const updatedFilters = {
      ...selected_filters,
      [name]: value,
    };
    setSelected_filters(updatedFilters);

    if (rawData) {
      const chart1_aggregatedData = calculateChart(rawData, updatedFilters);
      setChart1_filteredData(chart1_aggregatedData);

      const chart2_aggregatedData = calculateChartDimension(rawData, updatedFilters, 'business_unit');
      setChart2_filteredData(chart2_aggregatedData);
    }
  };

  // render the html
  if (!chart1_filteredData || !rawData) {
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
      <h1 className="my-4">Overview Page</h1>
      <p>The overview page provides an executive overview of how the organisation is performing.</p>
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
              id="orgCategories"
              title="Organisational score over time"
              description="Organisational performance across all metrics."
              data={chart1_filteredData}
              x="datestamp"
              y={[ "value" , "slo" , "slo_min"]}
              custom={ { "value" : { "label" : "Score", "showMark" : true } , "slo" : { "color" : "green", "label" : "Target"}, "slo_min" : { "color" : "yellow" , label: "SLO min"} }}
          />
          <ChartLine
              id="BUCategories"
              title="Business Unit score over time"
              description="View the scores for all business units in one multi-line graph."
              data={chart2_filteredData}
              x="datestamp"
              y={[ "value" ]}
              z="business_unit"
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
