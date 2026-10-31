import { Paper, Typography } from '@mui/material';

const ChartCard = ({ title, subtitle = null, children }) => (
  <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
    <Typography variant="h2" component="h2">{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    {children}
  </Paper>
);

export default ChartCard;
