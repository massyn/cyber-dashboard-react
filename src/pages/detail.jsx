import { useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  Container,
  Grid,
  Link,
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
import ChartLine from '../components/ChartLine';
import Filters from '../components/Filters';
import DataGate from '../data/DataGate';
import { useDashboardData } from '../data/useDashboardData';
import { filterData, pivotData } from '../utils/processData';

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

const computeData = (summary, detail, metric_id, filters) => {
  // Chart: aggregate summary rows for this metric by datestamp
  const summaryRows = filterData(summary, { ...filters, metric_id });

  const first = summaryRows[0];
  const metricInfo = first ? {
    title:    first.title,
    category: first.category,
    slo:      parseFloat(first.slo),
    slo_min:  parseFloat(first.slo_min),
  } : null;

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
  }));

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

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleSort = (col) => {
    setSortDir(prev => (sortCol === col && prev === 'asc' ? 'desc' : 'asc'));
    setSortCol(col);
  };

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

  return (
    <Container>
      <Typography sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/metrics">&larr; Back to Metrics</Link>
      </Typography>

      <Typography variant="h3" component="h1" sx={{ my: 3 }}>{metricInfo?.title ?? metric_id}</Typography>
      {metricInfo && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Category: <strong>{metricInfo.category}</strong>
          &ensp;&mdash;&ensp;Target: <strong>{Math.round(metricInfo.slo * 100)}%</strong>
          &ensp;&mdash;&ensp;Min: <strong>{Math.round(metricInfo.slo_min * 100)}%</strong>
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Filters data={summaryData} onChange={handleDropdownChange} filters={filters} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {chartData.length > 0 ? (
            <ChartLine
              id="metricDetail"
              title="Score over time"
              data={chartData}
              x="datestamp"
              y={['value', 'slo', 'slo_min']}
              custom={{
                value:   { label: 'Score', showMark: true },
                slo:     { color: 'green', label: 'Target' },
                slo_min: { color: 'orange', label: 'SLO min' },
              }}
            />
          ) : (
            <Typography color="text.secondary">No chart data for the selected filters.</Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 4, mb: 2 }}>
            <Typography variant="h5">
              Evidence{latestDate && (
                <Box component="span" sx={{ fontWeight: 400, fontSize: '0.8em' }}> ({latestDate})</Box>
              )}
            </Typography>
            <ToggleButtonGroup
              value={complianceFilter}
              exclusive
              size="small"
              onChange={(_, val) => { if (val !== null) { setComplianceFilter(val); setPage(0); } }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="compliant">Compliant</ToggleButton>
              <ToggleButton value="non-compliant">Non-Compliant</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {filteredEvidence.length === 0 ? (
            <Typography color="text.secondary">No evidence for the selected filters.</Typography>
          ) : (
            <Paper variant="outlined">
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {COLUMNS.map(col => (
                        <TableCell
                          key={col.key}
                          align={col.key === 'compliance' ? 'right' : 'left'}
                          sortDirection={sortCol === col.key ? sortDir : false}
                        >
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
                      const pct = row.compliance * 100;
                      const chipColor = pct >= 100 ? 'success' : pct <= 0 ? 'error' : 'warning';
                      return (
                        <TableRow key={`${row.business_unit}|${row.team}|${row.location}|${row.resource}`} hover>
                          <TableCell>{row.resource}</TableCell>
                          <TableCell>{row.business_unit}</TableCell>
                          <TableCell>{row.team}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell align="right">
                            <Chip label={`${pct.toFixed(0)}%`} color={chipColor} size="small" />
                          </TableCell>
                          <TableCell>{row.detail}</TableCell>
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
            </Paper>
          )}
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
