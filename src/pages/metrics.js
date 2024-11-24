import React, { useEffect, useState } from 'react';
import { fetchAndExtractCSV } from '../utils/fetchData';
import { calculateChartDimension } from '../utils/calculateChartDimension';
import Filters from '../components/Filters';
import { processChartData } from '../utils/processData';
import { filterData } from '../utils/processData';
import { pivotData } from '../utils/processData';
import '../style.css';

import Accordion from '@mui/material/Accordion';
//import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const calculateMetrics = (data, filters = {}) => {
    const filteredData = filterData(data, filters); // Apply filters
  
    // Find the latest datestamp per metric_id
    const latestDatestampByMetricId = filteredData.reduce((acc, item) => {
      const { title, datestamp } = item;
      if (
        !acc[title] || 
        new Date(datestamp) > new Date(acc[title])
      ) {
        acc[title] = datestamp;
      }
      return acc;
    }, {});
  
    // Pivot the first layer
    const chart1_pivotData = pivotData(filteredData, ['datestamp', 'category', 'title'], {
      sum_total:   ['sum', 'total'],
      sum_totalok: ['sum', 'totalok'],
      weight:      ['avg', 'weight'],
      slo:         ['avg', 'slo'],
      slo_min:     ['avg', 'slo_min']
    });
  
    // Filter pivoted data to only include entries with the latest datestamp per metric
    const chart1_pivotData_latest = chart1_pivotData.filter(
      (item) => item.datestamp === latestDatestampByMetricId[item.title]
    );
  
    // Calculate additional metrics
    const chart1_pivotData_calculated = chart1_pivotData_latest.map((item) => ({
      ...item,
      score:   item.sum_total ? item.sum_totalok / item.sum_total : 0,
      slo:     item.slo,
      slo_min: item.slo_min
    }));
  
    // Group data by category
    const groupedByCategory = chart1_pivotData_calculated.reduce((acc, item) => {
      const { category } = item;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  
    return groupedByCategory;
};
  
const Metrics = () => {
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

                const chart1_aggregatedData = calculateChartDimension(data.rawData, {}, 'category');
                setChart1_filteredData(chart1_aggregatedData);

                const chart2_aggregatedData = calculateMetrics(data.rawData, {});
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
        const chart1_aggregatedData = calculateChartDimension(rawData, updatedFilters, 'category');
        setChart1_filteredData(chart1_aggregatedData);

        const chart2_aggregatedData = calculateMetrics(rawData, updatedFilters);
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

    const { values } = processChartData(chart1_filteredData, 'datestamp', ['value'], 'category');

    
    return (
        <div className="container">
            <h1 className="my-4">Metrics</h1>
            <p>Metrics are grouped by categories.  Expand a category to see what the metric is doing.</p>
            <div className="row">
                <div className="col-md-3">
                    <Filters
                        data={rawData}
                        onChange={handleDropdownChange}
                        filters={selected_filters}
                    />
                </div>

                <div className="col-md-9">
                {Object.entries(values).map(([key], index) => (
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                        <h6>{key} {`${(values[key]?.at(-1) * 100).toFixed(2)}%`}</h6>
                        </AccordionSummary>
                        <AccordionDetails>

                        <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
                        <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {chart2_filteredData[key].map((item, index) => (
                            <tr key={index}>
                            <td>{item.title}</td>
                            <td
  style={{
    backgroundColor:
      item.score >= item.slo
        ? "green"
        : item.score >= item.slo_min
        ? "yellow"
        : "red",
    color: "white", // Ensures text contrast for readability
    padding: "8px"  // Optional: Adds some spacing inside the cell
  }}
>
  {(item.score * 100).toFixed(2)}%
</td>

                            </tr>
                        ))}
                        </tbody>
                        </table>
                        </AccordionDetails>
                    </Accordion>
                ))}
                </div>
            </div>
        </div>
    );
};

export default Metrics;
