import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import FilterDropdown from '../components/FilterDropdown';
//import { fetchAndExtractCSV } from '../utils/fetchData';
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
        //const data = await fetchAndExtractCSV('/data.csv', [
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

    
  // Wrapper function for handling filter changes
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
    
    <div>
            <h1>Overview page</h1>
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

      <LineChart
        xAxis={[{ id: 'barCategories', data: filteredData.labels, scaleType: 'band' }]}
        series={[{ data: filteredData.values }]}
        width={500}
        height={300}
      />
    </div>
  );
};

export default Overview;
