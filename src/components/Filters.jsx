import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { TuneRounded as FilterIcon } from '@mui/icons-material';

const FILTER_FIELDS = [
    { name: 'business_unit', label: 'Business Unit' },
    { name: 'team',          label: 'Team' },
    { name: 'location',      label: 'Location' },
];

const Filters = ({ data, filters, onChange, onClear }) => {
    const active = FILTER_FIELDS.some(({ name }) => filters[name]);
    return (
        <Paper sx={{ p: 2.5, position: { md: 'sticky' }, top: { md: 88 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterIcon fontSize="small" color="primary" />
                <Typography variant="h3" component="h2" sx={{ flex: 1 }}>Filters</Typography>
                {onClear && (
                    <Button size="small" onClick={onClear} disabled={!active}>Clear</Button>
                )}
            </Box>
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
                        sx={{ mb: 2, '&:last-of-type': { mb: 0 } }}
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
};

export default Filters;
