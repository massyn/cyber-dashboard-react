import { LineChart } from '@mui/x-charts/LineChart';
import { processChartData } from '../utils/processChartData';
import GraphContainer from './GraphContainer';

const SERIES_COLOURS = ['#1565c0', '#2e7d32', '#c62828', '#6a1b9a', '#ef6c00', '#00838f', '#5d4037', '#ad1457', '#455a64'];

const ChartLine = ({ id, title, data, x, y = [], z = null, custom = null, description = null }) => {
    const { labels, values } = processChartData(data, x, y, z);
    return (
        <GraphContainer title={title} description={description}>
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
                series={Object.entries(values).map(([key, series], index) => ({
                    id: key,
                    data: series.map((value) => Math.round(value * 10000) / 100),
                    label: custom?.[key]?.label ?? key,
                    color: custom?.[key]?.color ?? SERIES_COLOURS[index % SERIES_COLOURS.length],
                    showMark: custom?.[key]?.showMark ?? false,
                    valueFormatter: (value) => `${value}%`,
                }))}
                hideLegend
                height={400}
            />
        </GraphContainer>
    );
};

export default ChartLine;
