import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import FilterDropdown from '../components/FilterDropdown';
import { fetchAndExtractJSON } from '../utils/fetchData';
import { handleFilterChange } from '../utils/handleFilterChange';
import { aggregateData } from '../utils/aggregateData';

const Overview = () => {
  const [chartData, setChartData] = useState(null);
  const [filters, setFilters] = useState({
    businessUnit: '',
    team: '',
    location: '',
  });
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchAndExtractJSON('/data.json', [
          'business_unit',
          'team',
          'location',
        ]);
        setChartData(data);

        const aggregatedData = aggregateData(data.rawData);
        setFilteredData(aggregatedData);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  const handleDropdownChange = (event) =>
    handleFilterChange({
      event,
      filters,
      setFilters,
      data: chartData.rawData,
      setFilteredData,
    });

  if (!filteredData || !chartData) {
    return <h1>Loading....</h1>;
  }

  return (
    <div className="container">
      <h1 className="my-4">Overview Page</h1>
      <pre>The overview page provides an executive overview of how the organisation is performing.</pre>
      <div className="row">
        {/* Filters Section */}
        <div className="col-md-3">
          <div
            className="card p-3 mb-4"
            style={{
              backgroundColor: '#f8f9fa', // Light gray background
              border: '1px solid #ddd', // Subtle border for definition
              borderRadius: '8px', // Rounded corners for a modern look
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Light shadow for separation
            }}
          >
            <h5 className="card-title">Filters</h5>
            <FilterDropdown
              label="Business Unit"
              options={chartData.business_unit}
              value={filters.businessUnit}
              onChange={handleDropdownChange}
              name="businessUnit"
            />
            <FilterDropdown
              label="Team"
              options={chartData.team}
              value={filters.team}
              onChange={handleDropdownChange}
              name="team"
            />
            <FilterDropdown
              label="Location"
              options={chartData.location}
              value={filters.location}
              onChange={handleDropdownChange}
              name="location"
            />
          </div>
        </div>

        {/* Chart Section */}
        <div className="col-md-9">
          <div
            className="card p-3 mb-4"
            style={{
              backgroundColor: '#ffffff', // White background for the chart
              border: '1px solid #ddd', // Subtle border for definition
              borderRadius: '8px', // Rounded corners for a modern look
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Light shadow for separation
            }}
          >
            <h5 className="card-title">Organisational score over time</h5>
            <LineChart
              xAxis={[{ id: 'barCategories', data: filteredData.labels, scaleType: 'band' }]}
              series={[{ data: filteredData.values }]}
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
