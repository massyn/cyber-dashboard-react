import { MenuItem, Paper, TextField, Typography } from '@mui/material';

const FILTER_FIELDS = [
    { name: 'business_unit', label: 'Business Unit' },
    { name: 'team',          label: 'Team' },
    { name: 'location',      label: 'Location' },
];

const Filters = ({ data, filters, onChange }) => (
    <Paper
        variant="outlined"
        sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: '#e8f0f8', borderColor: '#b3c8e0' }}
    >
        <Typography variant="h6" component="h5" sx={{ mb: 2, color: '#0d2137' }}>Filters</Typography>
        {FILTER_FIELDS.map(({ name, label }) => {
            const options = [...new Set(data.map(item => item[name]))].filter(Boolean).sort();
            return (
                <TextField
                    key={name}
                    select
                    fullWidth
                    size="small"
                    id={`${name}-filter`}
                    name={name}
                    label={label}
                    value={filters[name] ?? ''}
                    onChange={onChange}
                    sx={{ mb: 2, backgroundColor: '#fff' }}
                    slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                >
                    <MenuItem value="">All</MenuItem>
                    {options.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
            );
        })}
    </Paper>
);

export default Filters;
