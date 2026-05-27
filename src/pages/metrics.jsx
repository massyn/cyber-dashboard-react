import React, { useEffect, useState } from 'react';
import { loadData } from '../utils/fetchData';
import { weightedCalculation } from '../utils/weightedCalculations';
import Filters from '../components/Filters';
import MetricComponent from '../components/MetricComponent';
import { processChartData } from '../utils/processChartData';
import { filterData } from '../utils/processData';
import { pivotData } from '../utils/processData';
import '../style.css';

import { Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

export const calculateMetrics = (data, filters = {}) => {
    const filteredData = filterData(data, filters);

    const latestDatestampByMetricId = filteredData.reduce((acc, item) => {
        const { title, datestamp } = item;
        if (!acc[title] || new Date(datestamp) > new Date(acc[title])) {
            acc[title] = datestamp;
        }
        return acc;
    }, {});

    const chart1_pivotData = pivotData(filteredData, ['datestamp', 'category', 'title', 'metric_id'], {
        sum_total:   ['sum', 'total'],
        sum_totalok: ['sum', 'totalok'],
        weight:      ['avg', 'weight'],
        slo:         ['avg', 'slo'],
        slo_min:     ['avg', 'slo_min'],
    });

    const chart1_pivotData_latest = chart1_pivotData.filter(
        (item) => item.datestamp === latestDatestampByMetricId[item.title]
    );

    const chart1_pivotData_calculated = chart1_pivotData_latest.map((item) => ({
        ...item,
        score:   item.sum_total ? item.sum_totalok / item.sum_total : 0,
        slo:     item.slo,
        slo_min: item.slo_min,
    }));

    return chart1_pivotData_calculated.reduce((acc, item) => {
        const { category } = item;
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});
};

const Metrics = () => {
    const [rawData,           setRawData]           = useState(null);
    const [selected_filters,  setSelected_filters]  = useState('');
    const [categoryTrends,    setCategoryTrends]    = useState(null);
    const [metricsByCategory, setMetricsByCategory] = useState(null);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const { summaryData } = await loadData();
                setRawData(summaryData);
                setCategoryTrends(weightedCalculation(summaryData, {}, 'category'));
                setMetricsByCategory(calculateMetrics(summaryData, {}));
            } catch (error) {
                console.error('Error initialising data:', error);
            }
        };
        initializeData();
    }, []);

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        const updatedFilters = { ...selected_filters, [name]: value };
        setSelected_filters(updatedFilters);
        if (rawData) {
            setCategoryTrends(weightedCalculation(rawData, updatedFilters, 'category'));
            setMetricsByCategory(calculateMetrics(rawData, updatedFilters));
        }
    };

    if (!categoryTrends || !rawData) {
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

    const { values: sparkValues } = processChartData(categoryTrends, 'datestamp', ['value'], 'category');

    return (
        <div className="container">
            <h1 className="my-4">Metrics</h1>
            <p>Metrics are grouped by category. Expand a category to see the individual metrics.</p>
            <div className="row">
                <div className="col-md-3">
                    <Filters
                        data={rawData}
                        onChange={handleDropdownChange}
                        filters={selected_filters}
                    />
                </div>

                <div className="col-md-9">
                    {Object.entries(sparkValues).map(([category], index) => (
                        <Accordion key={index}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${index}-content`}
                                id={`panel-${index}-header`}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    gap: '1.5em',
                                    paddingRight: '0.5em',
                                }}>
                                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 500 }}>
                                        {category}
                                    </Typography>
                                    <div style={{ pointerEvents: 'none' }}>
                                        <SparkLineChart
                                            plotType="line"
                                            data={sparkValues[category] || []}
                                            height={48}
                                            width={160}
                                            colors={['#1565c0']}
                                        />
                                    </div>
                                    <Typography variant="h6" sx={{ width: '72px', textAlign: 'right', fontWeight: 600 }}>
                                        {`${(sparkValues[category]?.at(-1) * 100).toFixed(1)}%`}
                                    </Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                {(metricsByCategory[category] ?? []).map((item, i) => (
                                    <MetricComponent key={i} metric={item} />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Metrics;
