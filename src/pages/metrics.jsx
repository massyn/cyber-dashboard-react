import { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { lineClasses } from '@mui/x-charts/LineChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import Filters from '../components/Filters';
import MetricComponent from '../components/MetricComponent';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { calculateMetrics } from '../utils/calculateMetrics';
import { processChartData } from '../utils/processChartData';
import { complianceStatus, formatPercent } from '../utils/status';
import { weightedCalculation } from '../utils/weightedCalculations';

const MetricsContent = ({ summaryData }) => {
    const { vars } = useTheme();
    const [filters, setFilters] = useState({});

    const { categories, metricsByCategory } = useMemo(() => {
        const trends = weightedCalculation(summaryData, filters, 'category');
        const { values } = processChartData(trends, 'datestamp', ['value'], 'category');
        const latestDate = trends.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
        return {
            categories: Object.entries(values).map(([name, series]) => {
                const latest = trends.find(r => r.category === name && r.datestamp === latestDate);
                return { name, series, latest };
            }),
            metricsByCategory: calculateMetrics(summaryData, filters),
        };
    }, [summaryData, filters]);

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Container sx={{ pb: 6 }}>
            <PageHeader title="Metrics" subtitle="Grouped by category. Expand a category to see its metrics." />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} onClear={() => setFilters({})} />
                </Grid>

                <Grid size={{ xs: 12, md: 9 }}>
                    {categories.length === 0 && (
                        <Typography color="text.secondary">No metrics for the selected filters.</Typography>
                    )}
                    {categories.map(({ name, series, latest }, index) => {
                        const metrics = metricsByCategory[name] ?? [];
                        return (
                            <Accordion key={name} defaultExpanded={index === 0}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel-${index}-content`}
                                    id={`panel-${index}-header`}
                                    sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 1.5 } }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: { xs: 1.5, sm: 3 }, pr: 1 }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h2" component="h2">{name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {metrics.length} {metrics.length === 1 ? 'metric' : 'metrics'}
                                            </Typography>
                                        </Box>
                                        {latest && (
                                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                <StatusChip status={complianceStatus(latest.value, latest.slo, latest.slo_min)} />
                                            </Box>
                                        )}
                                        <Box sx={{ pointerEvents: 'none', display: { xs: 'none', sm: 'block' } }}>
                                            <SparkLineChart
                                                plotType="line"
                                                data={series}
                                                height={40}
                                                width={140}
                                                area
                                                color={vars.palette.primary.main}
                                                sx={{ [`& .${lineClasses.area}`]: { fillOpacity: 0.1 } }}
                                            />
                                        </Box>
                                        <Typography sx={{ width: 76, textAlign: 'right', fontSize: '1.5rem', fontWeight: 650 }}>
                                            {formatPercent(series.at(-1))}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {metrics.map(item => (
                                        <MetricComponent key={item.metric_id} metric={item} />
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
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
