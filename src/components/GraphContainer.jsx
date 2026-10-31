import { Paper, Typography } from '@mui/material';

const GraphContainer = ({ title, description, children }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, borderColor: '#b3c8e0' }}>
        <Typography variant="h6" component="h5" sx={{ mb: 1, color: '#0d2137' }}>{title}</Typography>
        {description && <Typography sx={{ mb: 1 }}>{description}</Typography>}
        {children}
    </Paper>
);

export default GraphContainer;
