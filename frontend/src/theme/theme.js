import { createTheme } from '@mui/material/styles';

/**
 * Kumar Pricing — Material UI Theme
 * Premium enterprise automobile theme inspired by Hero MotoCorp.
 * Clean light background, red accents, dark typography.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E31837',        // Hero Red
      light: '#FF4D5E',
      dark: '#B00018',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#111111',        // Dark Charcoal / Black
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#F4F6F8',     // Very light grey background
      paper: '#FFFFFF',       // Clean white for cards
    },
    text: {
      primary: '#111111',
      secondary: '#4B5563',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.3px' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6F8',
          minHeight: '100vh',
        },
        '*::-webkit-scrollbar': { width: '8px', height: '8px' },
        '*::-webkit-scrollbar-track': { background: '#F1F5F9' },
        '*::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: '4px' },
        '*::-webkit-scrollbar-thumb:hover': { background: '#94A3B8' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(227, 24, 55, 0.25)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#111111',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E31837',
            }
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#111111',
            color: '#ffffff',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  },
});

export default theme;
