const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("Installing RTL support packages...");

try {
  // Install RTL dependencies
  execSync('npm install stylis-plugin-rtl@2.1.1 stylis@4.1.1 --save', { stdio: 'inherit' });
  
  console.log("RTL packages installed successfully!");
  console.log("Please restart your development server with 'npm run dev'");
  
  // Update main.jsx with the correct imports
  const mainJsxPath = path.join(__dirname, 'src', 'main.jsx');
  const mainJsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from './App';
import theme from './theme';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);`;

  fs.writeFileSync(mainJsxPath, mainJsxContent);
  
  // Update theme.js to re-add RTL direction
  const themeJsPath = path.join(__dirname, 'src', 'theme.js');
  const themeJsContent = `import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#2E86C1',
      light: '#3498DB',
      dark: '#1A5276',
    },
    secondary: {
      main: '#8E44AD',
      light: '#9B59B6',
      dark: '#6C3483',
    },
    success: {
      main: '#117A65',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2E86C1',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          direction: 'rtl',
        },
      },
    },
  },
});

export default theme;`;

  fs.writeFileSync(themeJsPath, themeJsContent);
  
  console.log("Files updated successfully!");
} catch (error) {
  console.error("An error occurred:", error);
}
