import { Alert, Box, CircularProgress, Typography } from '@mui/material';

// Shows a spinner while data loads and an error if it fails; renders children once data is ready.
const DataGate = ({ data, error, children }) => {
  if (error) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="error">
          The dashboard data could not be loaded. {error.message}
        </Alert>
      </Box>
    );
  }
  if (!data) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 12, px: 2, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="h5" sx={{ mt: 3 }}>Please wait while the data is loading...</Typography>
        <Typography color="text.secondary">This may take a moment depending on the size of your data.</Typography>
      </Box>
    );
  }
  return children(data);
};

export default DataGate;
