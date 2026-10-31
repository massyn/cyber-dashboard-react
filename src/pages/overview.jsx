import { useMemo, useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import ChartLine from '../components/ChartLine';
import Filters from '../components/Filters';
import GraphContainer from '../components/GraphContainer';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { weightedCalculation } from '../utils/weightedCalculations';

const extractLatest = (data, dimensionKey) => {
  if (!data || data.length === 0) return { labels: [], values: [] };
  const latest = data.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
  const rows = data
    .filter(r => r.datestamp === latest)
    .sort((a, b) => a.value - b.value);
  return {
    labels: rows.map(r => r[dimensionKey]),
    values: rows.map(r => parseFloat((r.value * 100).toFixed(1))),
  };
};

const HorizontalBar = ({ title, labels, values }) => {
  if (labels.length === 0) return null;
  return (
    <GraphContainer title={title}>
      <Box sx={{ py: 1 }}>
        {labels.map((label, i) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1.25 }}>
            <Box sx={{ width: 130, textAlign: 'right', pr: 1.25, fontSize: 13, flexShrink: 0, color: '#333' }}>
              {label}
            </Box>
            <Box sx={{ flex: 1, backgroundColor: '#e0e8f0', borderRadius: 1, height: 28 }}>
              <Box sx={{
                width: `${values[i]}%`,
                backgroundColor: 'primary.main',
                height: '100%',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: 1,
                minWidth: 44,
              }}>
                <Box component="span" sx={{ color: 'white', fontSize: 11, fontWeight: 600 }}>
                  {values[i]?.toFixed(1)}%
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </GraphContainer>
  );
};

const OverviewContent = ({ summaryData }) => {
  const [filters, setFilters] = useState({});

  const { orgTrend, buLatest, catLatest } = useMemo(() => ({
    orgTrend:  weightedCalculation(summaryData, filters),
    buLatest:  extractLatest(weightedCalculation(summaryData, filters, 'business_unit'), 'business_unit'),
    catLatest: extractLatest(weightedCalculation(summaryData, filters, 'category'), 'category'),
  }), [summaryData, filters]);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container>
      <Typography variant="h3" component="h1" sx={{ my: 3 }}>Overview</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {orgTrend.length > 0 ? (
            <ChartLine
              id="orgScore"
              title="Organisational score over time"
              data={orgTrend}
              x="datestamp"
              y={['value', 'slo', 'slo_min']}
              custom={{
                value:   { label: 'Score', showMark: true },
                slo:     { color: 'green',  label: 'Target'  },
                slo_min: { color: 'orange', label: 'SLO min' },
              }}
            />
          ) : (
            <Typography color="text.secondary">No data for the selected filters.</Typography>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <HorizontalBar title="Business Units" labels={buLatest.labels} values={buLatest.values} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <HorizontalBar title="Categories" labels={catLatest.labels} values={catLatest.values} />
            </Grid>
          </Grid>
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
