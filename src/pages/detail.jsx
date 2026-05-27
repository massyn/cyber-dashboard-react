import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { fetchAndExtractCSV } from '../utils/fetchData';
import { filterData, pivotData } from '../utils/processData';
import ChartLine from '../components/ChartLine';
import Filters from '../components/Filters';
import '../style.css';

import {
  Chip,
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

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 25;

const COLUMNS = [
  { key: 'resource',      label: 'Resource' },
  { key: 'business_unit', label: 'Business Unit' },
  { key: 'team',          label: 'Team' },
  { key: 'location',      label: 'Location' },
  { key: 'compliant',     label: 'Compliant' },
  { key: 'detail',        label: 'Detail' },
];

const Detail = () => {
  const { metric_id } = useParams();

  const [rawData,          setRawData]          = useState(null);
  const [detailData,       setDetailData]       = useState(null);
  const [selected_filters, setSelected_filters] = useState({});
  const [chartData,        setChartData]        = useState(null);
  const [evidence,         setEvidence]         = useState([]);
  const [metricInfo,       setMetricInfo]       = useState(null);
  const [latestDate,       setLatestDate]       = useState(null);

  const [page,             setPage]             = useState(0);
  const [rowsPerPage,      setRowsPerPage]      = useState(DEFAULT_ROWS_PER_PAGE);
  const [sortCol,          setSortCol]          = useState('resource');
  const [sortDir,          setSortDir]          = useState('asc');
  const [complianceFilter, setComplianceFilter] = useState('all');

  useEffect(() => {
    const init = async () => {
      try {
        const [summary, detail] = await Promise.all([
          fetchAndExtractCSV('/summary.csv'),
          fetchAndExtractCSV('/detail.csv'),
        ]);
        setRawData(summary.rawData);
        setDetailData(detail.rawData);
        computeData(summary.rawData, detail.rawData, {});
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    init();
  }, [metric_id]);

  const computeData = (summary, detail, filters) => {
    // Chart: aggregate summary rows for this metric by datestamp
    const summaryRows = filterData(summary, { ...filters, metric_id });

    if (summaryRows.length > 0) {
      const first = summaryRows[0];
      setMetricInfo({
        title:    first.title,
        category: first.category,
        slo:      parseFloat(first.slo),
        slo_min:  parseFloat(first.slo_min),
      });
    }

    const pivoted = pivotData(summaryRows, ['datestamp'], {
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
    setChartData(pivoted);

    // Evidence: detail rows filtered to this metric + latest datestamp
    const detailRows = filterData(detail, { ...filters, metric_id });
    const latest = detailRows.reduce((max, r) => (r.datestamp > max ? r.datestamp : max), '');
    setLatestDate(latest);
    setEvidence(
      detailRows
        .filter(r => r.datestamp === latest)
        .map(r => ({ ...r, compliant: parseFloat(r.compliant) }))
    );
    setPage(0);
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    const updated = { ...selected_filters, [name]: value };
    setSelected_filters(updated);
    if (rawData && detailData) computeData(rawData, detailData, updated);
  };

  const handleSort = (col) => {
    if (col === 'status') return; // status is derived — sort by compliant instead
    setSortDir(prev => (sortCol === col && prev === 'asc' ? 'desc' : 'asc'));
    setSortCol(col);
  };

  const filteredEvidence = evidence.filter(r => {
    if (complianceFilter === 'compliant')     return r.compliant >= 1;
    if (complianceFilter === 'non-compliant') return r.compliant < 1;
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

  if (!chartData || !rawData) {
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

  return (
    <div className="container">
      <p className="mt-3">
        <RouterLink to="/metrics">&larr; Back to Metrics</RouterLink>
      </p>

      <h1 className="my-4">{metricInfo?.title ?? metric_id}</h1>
      {metricInfo && (
        <p className="text-muted">
          Category: <strong>{metricInfo.category}</strong>
          &ensp;&mdash;&ensp;Target: <strong>{Math.round(metricInfo.slo * 100)}%</strong>
          &ensp;&mdash;&ensp;Min: <strong>{Math.round(metricInfo.slo_min * 100)}%</strong>
        </p>
      )}

      <div className="row">
        <div className="col-md-3">
          <Filters
            data={rawData}
            onChange={handleDropdownChange}
            filters={selected_filters}
          />
        </div>

        <div className="col-md-9">
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
            <p className="text-muted">No chart data for the selected filters.</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginTop: '2rem', marginBottom: '1rem' }}>
            <Typography variant="h5">
              Evidence{latestDate && (
                <span style={{ fontWeight: 400, fontSize: '0.8em' }}> ({latestDate})</span>
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
          </div>

          {filteredEvidence.length === 0 ? (
            <p className="text-muted">No evidence for the selected filters.</p>
          ) : (
            <Paper variant="outlined">
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {COLUMNS.map(col => (
                        <TableCell
                          key={col.key}
                          align={col.key === 'compliant' ? 'right' : 'left'}
                          sortDirection={sortCol === col.key ? sortDir : false}
                        >
                          {col.key === 'status' ? col.label : (
                            <TableSortLabel
                              active={sortCol === col.key}
                              direction={sortCol === col.key ? sortDir : 'asc'}
                              onClick={() => handleSort(col.key)}
                            >
                              {col.label}
                            </TableSortLabel>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((row, i) => {
                      const pct = row.compliant * 100;
                      const chipColor = pct >= 100 ? 'success' : pct <= 0 ? 'error' : 'warning';
                      return (
                        <TableRow key={i} hover>
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
        </div>
      </div>
    </div>
  );
};

export default Detail;
