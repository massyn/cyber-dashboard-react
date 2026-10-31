import { Box, Paper, Typography } from '@mui/material';
import {
  ArrowDownwardRounded as DownIcon,
  ArrowUpwardRounded as UpIcon,
  RemoveRounded as FlatIcon,
} from '@mui/icons-material';

// Signed change in percentage points; up is good for compliance scores.
const Delta = ({ value, period }) => {
  const points = value * 100;
  const rounded = Math.round(points * 10) / 10;
  const Icon = rounded > 0 ? UpIcon : rounded < 0 ? DownIcon : FlatIcon;
  const colour = rounded > 0 ? 'success.main' : rounded < 0 ? 'error.main' : 'text.secondary';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
      <Icon sx={{ fontSize: 16, color: colour }} />
      <Typography variant="body2" sx={{ color: colour, fontWeight: 600 }}>
        {rounded > 0 ? '+' : ''}{rounded.toFixed(1)} pts
      </Typography>
      {period && <Typography variant="body2" color="text.secondary">vs {period}</Typography>}
    </Box>
  );
};

const StatTile = ({ label, value, hero = false, delta = null, deltaPeriod = null, footer = null }) => (
  <Paper sx={{ p: hero ? 3 : 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>{label}</Typography>
    <Typography
      component="p"
      sx={{ fontSize: hero ? '3.25rem' : '1.75rem', fontWeight: 650, lineHeight: 1.1, letterSpacing: '-0.02em' }}
    >
      {value}
    </Typography>
    {delta !== null && Number.isFinite(delta) && <Delta value={delta} period={deltaPeriod} />}
    {footer && <Box sx={{ mt: 'auto', pt: 1.5 }}>{footer}</Box>}
  </Paper>
);

export default StatTile;
