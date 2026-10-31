import { createTheme } from '@mui/material/styles';

// Status colours carry meaning (good / at risk / below minimum) and are never reused as series colours.
export const STATUS_COLOURS = {
  good:     '#0ca30c',
  warning:  '#fab219',
  critical: '#d03b3b',
};

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: {
      palette: {
        primary:    { main: '#2a78d6', dark: '#1c5cab', light: '#86b6ef' },
        secondary:  { main: '#eb6834' },
        success:    { main: STATUS_COLOURS.good, contrastText: '#ffffff' },
        warning:    { main: STATUS_COLOURS.warning, contrastText: '#0b0b0b' },
        error:      { main: STATUS_COLOURS.critical, contrastText: '#ffffff' },
        background: { default: '#f4f6f9', paper: '#ffffff' },
        text:       { primary: '#0b0b0b', secondary: '#52514e' },
        divider:    '#e1e0d9',
        chart:      { grid: '#e1e0d9', muted: '#898781', track: '#e6eef8', reference: '#52514e' },
        brand:      { bar: '#0d2137', barText: '#ffffff', accent: '#86b6ef' },
      },
    },
    dark: {
      palette: {
        primary:    { main: '#3987e5', dark: '#2a78d6', light: '#86b6ef' },
        secondary:  { main: '#d95926' },
        success:    { main: STATUS_COLOURS.good, contrastText: '#ffffff' },
        warning:    { main: STATUS_COLOURS.warning, contrastText: '#0b0b0b' },
        error:      { main: STATUS_COLOURS.critical, contrastText: '#ffffff' },
        background: { default: '#0d0d0d', paper: '#1a1a19' },
        text:       { primary: '#f0efec', secondary: '#c3c2b7' },
        divider:    '#2c2c2a',
        chart:      { grid: '#2c2c2a', muted: '#898781', track: '#1c2a3d', reference: '#c3c2b7' },
        brand:      { bar: '#101c2b', barText: '#f0efec', accent: '#86b6ef' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: FONT_STACK,
    h1: { fontSize: '2rem', fontWeight: 650, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1rem', fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: '0.08em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.vars.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { border: 'none' } },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          marginBottom: theme.spacing(1.5),
          '&::before': { display: 'none' },
          '&:first-of-type, &:last-of-type': { borderRadius: theme.shape.borderRadius },
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },
  },
});

export default theme;
