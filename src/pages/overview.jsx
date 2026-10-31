import { useMemo, useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import Filters from '../components/Filters';
import PageHeader from '../components/PageHeader';
import RankedBars from '../components/RankedBars';
import ScoreTrendChart from '../components/ScoreTrendChart';
import StatTile from '../components/StatTile';
import StatusChip from '../components/StatusChip';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { calculateMetrics } from '../utils/calculateMetrics';
import { complianceStatus, formatPercent, formatPeriod } from '../utils/status';
import { weightedCalculation } from '../utils/weightedCalculations';

const byDate = (a, b) => (a.datestamp > b.datestamp ? 1 : -1);

// Rows for the latest period, lowest score first, shaped for RankedBars.
const latestRanked = (data, dimensionKey) => {
  if (data.length === 0) return [];
  const latest = data.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
  return data
    .filter(r => r.datestamp === latest)
    .sort((a, b) => a.value - b.value)
    .map(r => ({ label: r[dimensionKey], value: r.value, slo: r.slo, slo_min: r.slo_min }));
};

const OverviewContent = ({ summaryData }) => {
  const [filters, setFilters] = useState({});

  const { orgTrend, buRows, catRows, metricCounts } = useMemo(() => {
    const metrics = Object.values(calculateMetrics(summaryData, filters)).flat();
    const statuses = metrics.map(m => complianceStatus(m.score, m.slo, m.slo_min));
    return {
      orgTrend: weightedCalculation(summaryData, filters).sort(byDate),
      buRows:   latestRanked(weightedCalculation(summaryData, filters, 'business_unit'), 'business_unit'),
      catRows:  latestRanked(weightedCalculation(summaryData, filters, 'category'), 'category'),
      metricCounts: {
        total:    metrics.length,
        good:     statuses.filter(s => s === 'good').length,
        critical: statuses.filter(s => s === 'critical').length,
      },
    };
  }, [summaryData, filters]);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const latest = orgTrend.at(-1);
  const previous = orgTrend.at(-2);

  return (
    <Container sx={{ pb: 6 }}>
      <PageHeader
        title="Security posture"
        subtitle={latest ? `Weighted compliance across all metrics · latest period ${formatPeriod(latest.datestamp)}` : null}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} onClear={() => setFilters({})} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {!latest ? (
            <Typography color="text.secondary">No data for the selected filters.</Typography>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                  <StatTile
                    hero
                    label="Organisational score"
                    value={formatPercent(latest.value)}
                    delta={previous ? latest.value - previous.value : null}
                    deltaPeriod={previous ? formatPeriod(previous.datestamp) : null}
                    footer={<StatusChip status={complianceStatus(latest.value, latest.slo, latest.slo_min)} />}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3, lg: 'grow' }}>
                  <StatTile label="Target" value={formatPercent(latest.slo, 0)} footer={
                    <Typography variant="body2" color="text.secondary">Minimum {formatPercent(latest.slo_min, 0)}</Typography>
                  } />
                </Grid>
                <Grid size={{ xs: 6, sm: 3, lg: 'grow' }}>
                  <StatTile label="Metrics on target" value={`${metricCounts.good} / ${metricCounts.total}`} footer={
                    metricCounts.critical > 0
                      ? <StatusChip status="critical" label={`${metricCounts.critical} below minimum`} />
                      : <StatusChip status="good" label="None below minimum" />
                  } />
                </Grid>
              </Grid>

              <ScoreTrendChart
                title="Score over time"
                subtitle="Weighted organisational score against target and minimum"
                data={orgTrend}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <RankedBars title="Business units" subtitle="Latest period, lowest first" rows={buRows} />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <RankedBars title="Categories" subtitle="Latest period, lowest first" rows={catRows} />
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

const Overview = () => {
  const { data, error } = useDashboardData();
  return (
    <DataGate data={data} error={error}>
      {({ summaryData }) => <OverviewContent summaryData={summaryData} />}
    </DataGate>
  );
};

export default Overview;
