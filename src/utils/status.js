// Classifies a 0-1 score against its target (slo) and minimum (slo_min).
export const complianceStatus = (score, slo, sloMin) => {
  if (score >= slo) return 'good';
  if (score >= sloMin) return 'warning';
  return 'critical';
};

export const STATUS_LABELS = {
  good:     'On target',
  warning:  'At risk',
  critical: 'Below minimum',
};

// MUI palette key for each status.
export const STATUS_PALETTE = {
  good:     'success',
  warning:  'warning',
  critical: 'error',
};

export const formatPercent = (value, digits = 1) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : '–';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2024-03-01" -> "Mar 2024"; anything else is returned unchanged.
export const formatPeriod = (datestamp) => {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(datestamp ?? '');
  if (!match) return datestamp;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : datestamp;
};
