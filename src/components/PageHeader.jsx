import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle = null, eyebrow = null, actions = null }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mt: { xs: 3, md: 5 }, mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            {eyebrow && <Box sx={{ mb: 1 }}>{eyebrow}</Box>}
            <Typography variant="h1">{title}</Typography>
            {subtitle && <Typography color="text.secondary" sx={{ mt: 0.75 }}>{subtitle}</Typography>}
        </Box>
        {actions}
    </Box>
);

export default PageHeader;
