import { Chip } from '@mui/material';
import {
  CheckCircleRounded as GoodIcon,
  ErrorRounded as CriticalIcon,
  WarningRounded as WarningIcon,
} from '@mui/icons-material';
import { STATUS_LABELS, STATUS_PALETTE } from '../utils/status';

const ICONS = { good: GoodIcon, warning: WarningIcon, critical: CriticalIcon };

// Status is always shown as icon + label, never colour alone.
const StatusChip = ({ status, label = STATUS_LABELS[status], size = 'small', variant = 'outlined' }) => {
  const Icon = ICONS[status];
  return (
    <Chip
      icon={<Icon />}
      label={label}
      color={STATUS_PALETTE[status]}
      size={size}
      variant={variant}
      sx={variant === 'outlined' ? { color: 'text.primary', '& .MuiChip-icon': { color: `${STATUS_PALETTE[status]}.main` } } : undefined}
    />
  );
};

export default StatusChip;
