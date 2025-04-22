import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const AppTheme = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <ThemeToggle />
    </MuiThemeProvider>
  );
};

export default AppTheme;
