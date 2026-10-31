import { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Grid, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import Filters from '../components/Filters';
import MetricComponent from '../components/MetricComponent';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { calculateMetrics } from '../utils/calculateMetrics';
import { processChartData } from '../utils/processChartData';
import { weightedCalculation } from '../utils/weightedCalculations';

const MetricsContent = ({ summaryData }) => {
    const [filters, setFilters] = useState({});

    const { sparkValues, metricsByCategory } = useMemo(() => ({
        sparkValues: processChartData(
            weightedCalculation(summaryData, filters, 'category'), 'datestamp', ['value'], 'category'
        ).values,
        metricsByCategory: calculateMetrics(summaryData, filters),
    }), [summaryData, filters]);

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const categories = Object.keys(sparkValues);

    return (
        <Container>
            <Typography variant="h3" component="h1" sx={{ my: 3 }}>Metrics</Typography>
            <Typography sx={{ mb: 2 }}>Metrics are grouped by category. Expand a category to see the individual metrics.</Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} />
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    {categories.length === 0 && (
                        <Typography color="text.secondary">No metrics for the selected filters.</Typography>
                    )}
                    {categories.map((category, index) => (
                        <Accordion key={category}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${index}-content`}
                                id={`panel-${index}-header`}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 3, pr: 1 }}>
                                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 500 }}>
                                        {category}
                                    </Typography>
                                    <Box sx={{ pointerEvents: 'none', display: { xs: 'none', sm: 'block' } }}>
                                        <SparkLineChart
                                            plotType="line"
                                            data={sparkValues[category]}
                                            height={48}
                                            width={160}
                                            color="#1565c0"
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{ width: 72, textAlign: 'right', fontWeight: 600 }}>
                                        {`${(sparkValues[category].at(-1) * 100).toFixed(1)}%`}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {(metricsByCategory[category] ?? []).map(item => (
                                    <MetricComponent key={item.metric_id} metric={item} />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Grid>
            </Grid>
        </Container>
    );
};

const Metrics = () => {
    const { data, error } = useDashboardData();
    return (
        <DataGate data={data} error={error}>
            {({ summaryData }) => <MetricsContent summaryData={summaryData} />}
        </DataGate>
    );
};

export default Metrics;
