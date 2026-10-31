import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material';
import { processChartData } from '../utils/processChartData';
import { formatPeriod } from '../utils/status';
import ChartCard from './ChartCard';

const toPercent = (series = []) => series.map(value => Math.round(value * 1000) / 10);
const percentLabel = (value) => (value === null ? '–' : `${value}%`);

// Score over time (rows of { datestamp, value, slo, slo_min }), with target and minimum as thin reference series.
// The y-axis starts near the lowest value rather than at zero.
const ScoreTrendChart = ({ title, subtitle = null, data }) => {
  const { vars } = useTheme();
  const { labels, values } = processChartData(data, 'datestamp', ['value', 'slo', 'slo_min']);
  const score = toPercent(values.value);
  const target = toPercent(values.slo);
  const minimum = toPercent(values.slo_min);
  // A line needs no zero baseline: fit the axis to the data so movement is visible.
  const lowest = Math.min(...score, ...minimum);
  const yMin = Number.isFinite(lowest) ? Math.max(0, Math.floor((lowest - 5) / 10) * 10) : 0;

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <LineChart
        height={320}
        margin={{ left: 0, right: 32, top: 8, bottom: 0 }}
        grid={{ horizontal: true }}
        xAxis={[{
          data: labels,
          scaleType: 'point',
          valueFormatter: formatPeriod,
          disableTicks: true,
        }]}
        yAxis={[{
          min: yMin,
          max: 100,
          width: 44,
          valueFormatter: (value) => `${value}%`,
          disableTicks: true,
        }]}
        series={[
          {
            id: 'value',
            label: 'Score',
            data: score,
            curve: 'linear',
            color: vars.palette.primary.main,
            showMark: true,
            valueFormatter: percentLabel,
          },
          {
            id: 'slo',
            label: 'Target',
            data: target,
            curve: 'stepAfter',
            color: vars.palette.chart.reference,
            showMark: false,
            valueFormatter: percentLabel,
          },
          {
            id: 'slo_min',
            label: 'Minimum',
            data: minimum,
            curve: 'stepAfter',
            color: vars.palette.chart.muted,
            showMark: false,
            valueFormatter: percentLabel,
          },
        ]}
        slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
        sx={{
          [`& .${lineClasses.line}`]: { strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' },
          [`& .${lineClasses.line}[data-series="slo"], & .${lineClasses.line}[data-series="slo_min"]`]: { strokeWidth: 1.5 },
          [`& .${lineClasses.line}[data-series="slo_min"]`]: { strokeDasharray: '4 4' },
          '& .MuiChartsGrid-line': { stroke: vars.palette.chart.grid },
          '& .MuiChartsAxis-line': { stroke: vars.palette.chart.grid },
          '& .MuiChartsAxis-tickLabel': { fill: vars.palette.text.secondary },
        }}
      />
    </ChartCard>
  );
};

export default ScoreTrendChart;
