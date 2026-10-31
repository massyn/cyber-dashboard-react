import { Box, Tooltip, Typography } from '@mui/material';
import { complianceStatus, formatPercent, STATUS_LABELS, STATUS_PALETTE } from '../utils/status';
import {
  CheckCircleRounded as GoodIcon,
  ErrorRounded as CriticalIcon,
  WarningRounded as WarningIcon,
} from '@mui/icons-material';
import ChartCard from './ChartCard';

const ICONS = { good: GoodIcon, warning: WarningIcon, critical: CriticalIcon };

// Horizontal bars, lowest score first, each with a tick at its target and a status icon.
const RankedBars = ({ title, subtitle = null, rows }) => {
  if (rows.length === 0) return null;
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
        {rows.map(({ label, value, slo, slo_min }) => {
          const status = complianceStatus(value, slo, slo_min);
          const Icon = ICONS[status];
          return (
            <Tooltip
              key={label}
              placement="top"
              title={`${label}: ${formatPercent(value)} (target ${formatPercent(slo, 0)}, ${STATUS_LABELS[status].toLowerCase()})`}
            >
              <Box
                component="li"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(80px, 140px) 1fr 64px',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Typography variant="body2" noWrap sx={{ textAlign: 'right' }}>{label}</Typography>
                <Box sx={{ position: 'relative', height: 14, backgroundColor: 'chart.track', borderRadius: '0 4px 4px 0' }}>
                  <Box sx={{
                    width: `${Math.max(0, Math.min(1, value)) * 100}%`,
                    height: '100%',
                    backgroundColor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    left: `${slo * 100}%`,
                    top: -3,
                    bottom: -3,
                    width: 2,
                    backgroundColor: 'text.primary',
                    borderRadius: 1,
                  }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {formatPercent(value)}
                  </Typography>
                  <Icon sx={{ fontSize: 16, color: `${STATUS_PALETTE[status]}.main` }} aria-label={STATUS_LABELS[status]} />
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Vertical tick marks the target.
      </Typography>
    </ChartCard>
  );
};

export default RankedBars;
