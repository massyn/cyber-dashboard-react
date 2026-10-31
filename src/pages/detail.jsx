import { useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ArrowBackRounded as BackIcon } from '@mui/icons-material';
import Filters from '../components/Filters';
import PageHeader from '../components/PageHeader';
import ScoreTrendChart from '../components/ScoreTrendChart';
import StatTile from '../components/StatTile';
import StatusChip from '../components/StatusChip';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { filterData, pivotData } from '../utils/processData';
import { complianceStatus, formatPercent, formatPeriod } from '../utils/status';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 25;

const COLUMNS = [
  { key: 'resource',      label: 'Resource' },
  { key: 'business_unit', label: 'Business Unit' },
  { key: 'team',          label: 'Team' },
  { key: 'location',      label: 'Location' },
  { key: 'compliance',    label: 'Compliance' },
  { key: 'detail',        label: 'Detail' },
];

// Per-resource result: fully compliant, partly compliant or not compliant.
const resourceStatus = (compliance) => {
  if (compliance >= 1) return { status: 'good', label: 'Compliant' };
  if (compliance > 0) return { status: 'warning', label: `Partial ${formatPercent(compliance, 0)}` };
  return { status: 'critical', label: 'Non-compliant' };
};

const computeData = (summary, detail, metric_id, filters) => {
  // Chart: aggregate summary rows for this metric by datestamp
  const summaryRows = filterData(summary, { ...filters, metric_id });

  const first = summaryRows[0];
  const metricInfo = first ? { title: first.title, category: first.category } : null;

  const chartData = pivotData(summaryRows, ['datestamp'], {
    sum_total:   ['sum', 'total'],
    sum_totalok: ['sum', 'totalok'],
    slo:         ['avg', 'slo'],
    slo_min:     ['avg', 'slo_min'],
  }).map(item => ({
    datestamp: item.datestamp,
    value:     item.sum_total ? item.sum_totalok / item.sum_total : 0,
    slo:       item.slo,
    slo_min:   item.slo_min,
  })).sort((a, b) => (a.datestamp > b.datestamp ? 1 : -1));

  // Evidence: detail rows filtered to this metric + latest datestamp
  const detailRows = filterData(detail, { ...filters, metric_id });
  const latestDate = detailRows.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
  const evidence = detailRows
    .filter(r => r.datestamp === latestDate)
    .map(r => ({ ...r, compliance: parseFloat(r.compliance) }));

  return { metricInfo, chartData, latestDate, evidence };
};

const DetailContent = ({ summaryData, detailData, metric_id }) => {
  const [filters,          setFilters]          = useState({});
  const [page,             setPage]             = useState(0);
  const [rowsPerPage,      setRowsPerPage]      = useState(DEFAULT_ROWS_PER_PAGE);
  const [sortCol,          setSortCol]          = useState('resource');
  const [sortDir,          setSortDir]          = useState('asc');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const { metricInfo, chartData, latestDate, evidence } = useMemo(
    () => computeData(summaryData, detailData, metric_id, filters),
    [summaryData, detailData, metric_id, filters]
  );

  const updateFilters = (next) => {
    setFilters(next);
    setPage(0);
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    updateFilters({ ...filters, [name]: value });
  };

  const handleSort = (col) => {
    setSortDir(prev => (sortCol === col && prev === 'asc' ? 'desc' : 'asc'));
    setSortCol(col);
  };

  const compliantCount = evidence.filter(r => r.compliance >= 1).length;

  const filteredEvidence = evidence.filter(r => {
    if (complianceFilter === 'compliant')     return r.compliance >= 1;
    if (complianceFilter === 'non-compliant') return r.compliance < 1;
    return true;
  });

  const sorted = [...filteredEvidence].sort((a, b) => {
    const va = a[sortCol] ?? '';
    const vb = b[sortCol] ?? '';
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const latest = chartData.at(-1);
  const previous = chartData.at(-2);

  return (
    <Container sx={{ pb: 6 }}>
      <PageHeader
        eyebrow={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/metrics" size="small" startIcon={<BackIcon />} sx={{ ml: -1 }}>
              Metrics
            </Button>
            {metricInfo && <Chip label={metricInfo.category} size="small" variant="outlined" />}
            <Chip label={metric_id} size="small" variant="outlined" />
          </Box>
        }
        title={metricInfo?.title ?? metric_id}
        subtitle={latest ? `Latest period ${formatPeriod(latest.datestamp)}` : null}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} onClear={() => updateFilters({})} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {latest ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                  <StatTile
                    hero
                    label="Current score"
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
                  <StatTile label="Compliant resources" value={`${compliantCount} / ${evidence.length}`} footer={
                    <Typography variant="body2" color="text.secondary">
                      {evidence.length - compliantCount} need attention
                    </Typography>
                  } />
                </Grid>
              </Grid>

              <ScoreTrendChart title="Score over time" subtitle="Against target and minimum" data={chartData} />
            </>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 3 }}>No chart data for the selected filters.</Typography>
          )}

          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: { xs: 2, sm: 3 }, pb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h2">Evidence</Typography>
                {latestDate && (
                  <Typography variant="body2" color="text.secondary">Resources assessed in {formatPeriod(latestDate)}</Typography>
                )}
              </Box>
              <ToggleButtonGroup
                value={complianceFilter}
                exclusive
                size="small"
                onChange={(_, val) => { if (val !== null) { setComplianceFilter(val); setPage(0); } }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="compliant">Compliant</ToggleButton>
                <ToggleButton value="non-compliant">Non-compliant</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {filteredEvidence.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 3, pb: 3 }}>No evidence for the selected filters.</Typography>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 640 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {COLUMNS.map(col => (
                          <TableCell key={col.key} sortDirection={sortCol === col.key ? sortDir : false} sx={{ whiteSpace: 'nowrap' }}>
                            <TableSortLabel
                              active={sortCol === col.key}
                              direction={sortCol === col.key ? sortDir : 'asc'}
                              onClick={() => handleSort(col.key)}
                            >
                              {col.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginated.map(row => {
                        const { status, label } = resourceStatus(row.compliance);
                        return (
                          <TableRow key={`${row.business_unit}|${row.team}|${row.location}|${row.resource}`} hover>
                            <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' }}>
                              {row.resource}
                            </TableCell>
                            <TableCell>{row.business_unit}</TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}><StatusChip status={status} label={label} /></TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.detail}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredEvidence.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const Detail = () => {
  const { metric_id } = useParams();
  const { data, error } = useDashboardData();
  return (
    <DataGate data={data} error={error}>
      {({ summaryData, detailData }) => (
        // key resets filters, sorting and paging when moving to another metric
        <DetailContent key={metric_id} summaryData={summaryData} detailData={detailData} metric_id={metric_id} />
      )}
    </DataGate>
  );
};

export default Detail;
