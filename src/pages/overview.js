import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import FilterDropdown from '../components/FilterDropdown';
import { fetchAndExtractJSON } from '../utils/fetchData';
import { aggregateData } from '../utils/aggregateData';
import '../style.css'; // Import the CSS file

const Overview = () => {
  const [rawData, setRawData] = useState(null);
  const [selected_business_unit, setSelected_business_unit] = useState('');
  const [selected_team, setSelected_team] = useState('');
  const [selected_location, setSelected_location] = useState('');
  const [chart1_filteredData, setChart1_filteredData] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchAndExtractJSON('/overview.json');
        setRawData(data.rawData);
        const chart1_aggregatedData = aggregateData(data.rawData);
        setChart1_filteredData(chart1_aggregatedData);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
  }, []);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    if (name === 'business_unit') setSelected_business_unit(value);
    if (name === 'team') setSelected_team(value);
    if (name === 'location') setSelected_location(value);

    const updatedFilters = {
      business_unit: name === 'business_unit' ? value : selected_business_unit,
      team: name === 'team' ? value : selected_team,
      location: name === 'location' ? value : selected_location,
    };

    if (rawData) {
      const chart1_aggregatedData = aggregateData(rawData, updatedFilters);
      setChart1_filteredData(chart1_aggregatedData);
    }
  };

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
        {/* Filters Section */}
        <div className="col-md-3">
          <div className="card card-filters">
            <h5 className="card-title">Filters</h5>
            <FilterDropdown
              label="Business Unit"
              chartData={rawData}
              value={selected_business_unit}
              onChange={handleDropdownChange}
              name="business_unit"
            />
            <FilterDropdown
              label="Team"
              chartData={rawData}
              value={selected_team}
              onChange={handleDropdownChange}
              name="team"
            />
            <FilterDropdown
              label="Location"
              chartData={rawData}
              value={selected_location}
              onChange={handleDropdownChange}
              name="location"
            />
          </div>
        </div>

        {/* Chart Section */}
        <div className="col-md-9">
          <div className="card card-chart">
            <h5 className="card-title">Organisational score over time</h5>
            <LineChart
              xAxis={[{
                id: 'lineCategories',
                data: chart1_filteredData.labels,
                scaleType: 'band',
              }]}
              yAxis={[{
                id: 'percentageAxis',
                min: 0,
                max: 100,
                labelFormatter: (value) => `${value}%`,
              }]}
              series={[
                {
                  id: 'value',
                  data: chart1_filteredData.values.map((value) => (value * 100).toFixed(2)),
                  label: 'Value',
                  color: 'blue',
                },
                {
                  id: 'slo',
                  data: chart1_filteredData.sloAverages.map((value) => (value * 100).toFixed(2)),
                  label: 'SLO',
                  color: 'green',
                  showMark: false,
                },
                {
                  id: 'slo_min',
                  data: chart1_filteredData.sloMinAverages.map((value) => (value * 100).toFixed(2)),
                  label: 'SLO Min',
                  color: 'yellow',
                  showMark: false,
                },
              ]}
              width={800}
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
