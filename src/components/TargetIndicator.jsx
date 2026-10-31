import { Box, Typography } from '@mui/material';
import { formatPercent } from '../utils/status';

// Meter: the fill is the score, the track is a lighter step of the same hue, and the tick marks the target.
const TargetIndicator = ({ metric }) => (
    <Box sx={{ width: 160 }}>
        <Box sx={{ position: 'relative', height: 8, borderRadius: 4, backgroundColor: 'chart.track' }}>
            <Box sx={{
                width: `${Math.max(0, Math.min(1, metric.score)) * 100}%`,
                height: '100%',
                borderRadius: 4,
                backgroundColor: 'primary.main',
            }} />
            <Box sx={{
                position: 'absolute',
                left: `${metric.slo * 100}%`,
                top: -4,
                bottom: -4,
                width: 2,
                borderRadius: 1,
                backgroundColor: 'text.primary',
            }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            Target {formatPercent(metric.slo, 0)} · Min {formatPercent(metric.slo_min, 0)}
        </Typography>
    </Box>
);

export default TargetIndicator;
