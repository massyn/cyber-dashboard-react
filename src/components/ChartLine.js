// chartLine.js

import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const ChartLine = ({ id, title, data, x, y = [], z = null, custom = null } ) => {

    let data_clean;
    if(!z) {
        data_clean = data.map((item) =>
            [...new Set([x, ...y])].reduce((acc, key) => { 
                if (key in item) {
                    acc[key] = item[key];
                }
                return acc;
            }, {})
        );
    } else {
        data_clean = data.reduce((acc, item) => {
            const existing = acc.find(record => record[x] === item[x]);
            if (existing) {
                existing[item[z]] = item[y[0]];
            } else {
                const newRecord = {
                    [x]: item[x],
                    [item[z]]: item[y[0]],
                };
                acc.push(newRecord);
            }
            return acc;
        }, []);
        
    }
    
    const fieldNames = Object.keys(data_clean[0]).filter(field => field !== x);
    const labels = data_clean.map((item) => item[x]);
    const values = fieldNames.reduce((acc, field) => {
        acc[field] = data_clean.map((item) => item[field]);
        return acc;
    }, {});

    return (
        <div className="card card-chart">
            <h5 className="card-title">{title}</h5>
            <LineChart
                xAxis={[{
                    id: id,
                    data: labels,
                    scaleType: 'band',
                }]}

                yAxis={[{
                    id: 'percentageAxis',
                    min: 0,
                    max: 100,
                    valueFormatter: (value) => `${value}%`,
                }]}
                series={Object.entries(values).map(([key, data_clean], index) => ({
                    id: key, // Use the key as the id
                    data: data_clean.map((value) => (value * 100).toFixed(2)), // Map over the array of values
                    label: custom?.[key]?.label ?? key,
                    color: custom?.[key]?.color ?? ['blue', 'green', 'red', 'yellow', 'purple'][index % 5], // Cycle through colors
                    showMark: custom?.[key]?.showMark ?? false,
                }))}
                
                width={800}
                height={400}
            />
        </div>
    );
};

export default ChartLine;