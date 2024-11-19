// business_units.js
import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { fetchAndExtractJSON } from '../utils/fetchData'; 
import { aggregateDataByBusinessUnit } from '../utils/aggregateData'; // New function to handle aggregation
import '../style.css'; // Import the CSS file

const BusinessUnits = () => {
  const [rawData, setRawData] = useState(null);
  const [chart1_filteredData, setChart1_filteredData] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchAndExtractJSON('/overview.json');
        setRawData(data.rawData);

        // Aggregate data by business unit
        const aggregatedData = aggregateDataByBusinessUnit(data.rawData);
        setChart1_filteredData(aggregatedData);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
  }, []);

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

    console.log(chart1_filteredData);
  return (
    <div className="container">
      <h1 className="my-4">Business Units Overview</h1>
      <p>The overview page provides an executive overview of how the business units are performing.</p>
      <div className="row">
        {/* Chart Section */}
        <div className="col-md-12">
          <div className="card card-chart">
            <h5 className="card-title">Business Unit performance over time</h5>
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

              series={chart1_filteredData.series.map((unitData, index) => ({
                id: unitData.businessUnit,
                data: unitData.values.map((value) => (value * 100).toFixed(2)),
                label: unitData.businessUnit,
                color: ['blue', 'green', 'red', 'yellow', 'purple'][index % 5], // Cycle through colors
              }))}
              width={800}
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessUnits;
