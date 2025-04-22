import { createTheme } from '@mui/material/styles';

// Define keyframes for later use in components
const keyframes = {
  gradientAnimation: `
    @keyframes gradientAnimation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  glow: `
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(156, 39, 176, 0.4); }
      50% { box-shadow: 0 0 20px rgba(156, 39, 176, 0.7); }
      100% { box-shadow: 0 0 5px rgba(156, 39, 176, 0.4); }
    }
  `,
  lightGlow: `
    @keyframes lightGlow {
      0% { box-shadow: 0 0 5px rgba(30, 136, 229, 0.4); }
      50% { box-shadow: 0 0 20px rgba(30, 136, 229, 0.7); }
      100% { box-shadow: 0 0 5px rgba(30, 136, 229, 0.4); }
    }
  `
};

// Common values for both themes
const commonValues = {
  direction: 'rtl',
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
};

// Dark theme
export const darkTheme = createTheme({
  ...commonValues,
  palette: {
    mode: 'dark',
    primary: {
      main: '#9C27B0', // Purple 500
      light: '#BA68C8', // Purple 300
      dark: '#7B1FA2', // Purple 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#673AB7', // Deep Purple 500
      light: '#9575CD', // Deep Purple 300
      dark: '#512DA8', // Deep Purple 700
      contrastText: '#ffffff',
    },
    success: {
      main: '#00BFA5', // Teal A700
      light: '#1DE9B6', // Teal A400
      dark: '#00897B', // Teal 600
      contrastText: '#ffffff',
    },
    error: {
      main: '#FF5252', // Red A200
      light: '#FF8A80', // Red A100
      dark: '#D50000', // Red A700
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFD740', // Amber A200
      light: '#FFE57F', // Amber A100
      dark: '#FFC400', // Amber A700
      contrastText: '#000000',
    },
    info: {
      main: '#40C4FF', // Light Blue A200
      light: '#80D8FF', // Light Blue A100
      dark: '#00B0FF', // Light Blue A400
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      card: '#252525',
      dialog: '#2C2C2C',
      tooltip: 'rgba(48, 48, 48, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: 'rgba(255, 255, 255, 0.8)',
      hover: 'rgba(156, 39, 176, 0.12)',
      selected: 'rgba(156, 39, 176, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    gradients: {
      // Main gradients
      primary: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      secondary: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)',
      success: 'linear-gradient(135deg, #00BFA5 0%, #1DE9B6 100%)',
      info: 'linear-gradient(135deg, #40C4FF 0%, #80D8FF 100%)',
      warning: 'linear-gradient(135deg, #FFD740 0%, #FFE57F 100%)',
      error: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
      
      // Purple gradient variations
      purpleDeep: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)',
      purpleMild: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 50%, #BA68C8 100%)',
      purpleLight: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #CE93D8 100%)',
      purpleToDarkPurple: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
      purpleToIndigo: 'linear-gradient(135deg, #9C27B0 0%, #3F51B5 100%)',
      violetIndigo: 'linear-gradient(135deg, #673AB7 0%, #3F51B5 50%, #2196F3 100%)',
      
      // UI element gradients for dark theme
      navbar: 'linear-gradient(90deg, #4A148C 0%, #6A1B9A 50%, #7B1FA2 100%)',
      sidebarHeader: 'linear-gradient(to right, #311B92, #512DA8)',
      sidebarBody: 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)',
      card: 'linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)',
      buttonHover: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
      
      // Animated backgrounds
      mainBackground: 'linear-gradient(125deg, #121212, #1E1E1E, #252525, #1a1a1a)',
      animatedBackground: 'linear-gradient(125deg, #4A148C, #6A1B9A, #7B1FA2, #9C27B0, #AB47BC, #7E57C2, #5E35B1, #512DA8, #4527A0, #311B92)',
      heroGradient: 'linear-gradient(135deg, rgba(74, 20, 140, 0.7) 0%, rgba(123, 31, 162, 0.7) 50%, rgba(156, 39, 176, 0.7) 100%)',
      subtle: 'radial-gradient(circle at center, rgba(156, 39, 176, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
    },
    sidebar: {
      icon: 'rgba(255, 255, 255, 0.7)',
      activeIcon: '#9C27B0',
      text: 'rgba(255, 255, 255, 0.85)',
      activeText: '#BA68C8',
      hoverBackground: 'rgba(156, 39, 176, 0.08)',
      activeBackground: 'rgba(156, 39, 176, 0.15)',
      divider: 'rgba(255, 255, 255, 0.1)'
    },
    chat: {
      userBubble: 'linear-gradient(135deg, rgba(123, 31, 162, 0.9) 0%, rgba(156, 39, 176, 0.9) 100%)',
      userBubbleText: '#ffffff',
      botBubble: 'rgba(30, 30, 30, 0.9)',
      botBubbleText: 'rgba(255, 255, 255, 0.9)',
      botBubbleBorder: 'rgba(255, 255, 255, 0.1)'
    }
  },
  typography: {
    ...commonValues.typography,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 1.2,
      marginBottom: '0.5rem',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      color: 'rgba(255, 255, 255, 0.87)',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.85)',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.75)',
    }
  },
  shadows: [
    'none',
    '0 2px 5px 0 rgba(0,0,0,0.5)',
    '0 4px 8px 0 rgba(0,0,0,0.5)',
    '0 8px 16px 0 rgba(0,0,0,0.5)',
    '0 12px 24px 0 rgba(0,0,0,0.5)',
    '0 16px 32px 0 rgba(0,0,0,0.5)',
    '0 20px 40px 0 rgba(0,0,0,0.5)',
    '0 6px 12px -2px rgba(0,0,0,0.6), 0 3px 7px -3px rgba(0,0,0,0.5)',
    '0 13px 27px -5px rgba(0,0,0,0.6), 0 8px 16px -8px rgba(0,0,0,0.5)',
    '0 17px 40px -10px rgba(0,0,0,0.6), 0 10px 24px -12px rgba(0,0,0,0.5)',
    '0 20px 42px -12px rgba(0,0,0,0.6), 0 13px 32px -15px rgba(0,0,0,0.5)',
    '0 25px 50px -15px rgba(0,0,0,0.6), 0 15px 40px -20px rgba(0,0,0,0.5)',
    '0 30px 60px -20px rgba(0,0,0,0.6), 0 18px 48px -25px rgba(0,0,0,0.5)',
    '0 35px 65px -25px rgba(0,0,0,0.6), 0 20px 50px -30px rgba(0,0,0,0.5)',
    '0 40px 70px -30px rgba(0,0,0,0.6), 0 22px 55px -35px rgba(0,0,0,0.5)',
    '0 45px 75px -35px rgba(0,0,0,0.6), 0 25px 60px -40px rgba(0,0,0,0.5)',
    '0 50px 80px -40px rgba(0,0,0,0.6), 0 30px 65px -45px rgba(0,0,0,0.5)',
    '0 55px 85px -45px rgba(0,0,0,0.6), 0 35px 70px -50px rgba(0,0,0,0.5)',
    '0 60px 90px -50px rgba(0,0,0,0.6), 0 40px 75px -55px rgba(0,0,0,0.5)',
    '0 65px 95px -55px rgba(0,0,0,0.6), 0 45px 80px -60px rgba(0,0,0,0.5)',
    '0 70px 100px -60px rgba(0,0,0,0.6), 0 50px 85px -65px rgba(0,0,0,0.5)',
    '0 75px 105px -65px rgba(0,0,0,0.6), 0 55px 90px -70px rgba(0,0,0,0.5)',
    '0 80px 110px -70px rgba(0,0,0,0.6), 0 60px 95px -75px rgba(0,0,0,0.5)',
    '0 85px 115px -75px rgba(0,0,0,0.6), 0 65px 100px -80px rgba(0,0,0,0.5)',
    '0 90px 120px -80px rgba(0,0,0,0.6), 0 70px 105px -85px rgba(0,0,0,0.5)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          ...keyframes,
        },
        'body': {
          background: '#121212',
          backgroundSize: '300% 300%',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#9C27B0 #121212',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#121212',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(156, 39, 176, 0.5)',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: 'rgba(156, 39, 176, 0.8)',
            },
          },
        },
      }
    },
    // ... rest of dark theme components
  },
});

// Light theme
export const lightTheme = createTheme({
  ...commonValues,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Blue 700
      light: '#42A5F5', // Blue 400
      dark: '#1565C0', // Blue 800
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6A1B9A', // Purple 800
      light: '#8E24AA', // Purple 600
      dark: '#4A148C', // Purple 900
      contrastText: '#ffffff',
    },
    success: {
      main: '#00897B', // Teal 600
      light: '#26A69A', // Teal 400
      dark: '#00695C', // Teal 700
      contrastText: '#ffffff',
    },
    error: {
      main: '#E53935', // Red 600
      light: '#EF5350', // Red 400
      dark: '#C62828', // Red 800
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FF8F00', // Amber 800
      light: '#FFA726', // Amber 400
      dark: '#E65100', // Orange 900
      contrastText: '#000000',
    },
    info: {
      main: '#039BE5', // Light Blue 600
      light: '#29B6F6', // Light Blue 400
      dark: '#0277BD', // Light Blue 800
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
      card: '#F9FAFE',
      dialog: '#FFFFFF',
      tooltip: 'rgba(240, 240, 240, 0.95)',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(25, 118, 210, 0.04)',
      selected: 'rgba(25, 118, 210, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    gradients: {
      // Main gradients
      primary: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
      secondary: 'linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)',
      success: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
      info: 'linear-gradient(135deg, #039BE5 0%, #29B6F6 100%)',
      warning: 'linear-gradient(135deg, #FF8F00 0%, #FFA726 100%)',
      error: 'linear-gradient(135deg, #E53935 0%, #EF5350 100%)',
      
      // Blue gradient variations
      blueDeep: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
      blueMild: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)',
      blueLight: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 50%, #64B5F6 100%)',
      blueToPurple: 'linear-gradient(135deg, #1976D2 0%, #8E24AA 100%)',
      blueToTeal: 'linear-gradient(135deg, #1976D2 0%, #009688 100%)',
      
      // UI element gradients for light theme
      navbar: 'linear-gradient(90deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)',
      sidebarHeader: 'linear-gradient(to right, #1565C0, #1976D2)',
      sidebarBody: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 254, 0.95) 100%)',
      buttonHover: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
      
      // Animated backgrounds - enhance light theme animations
      mainBackground: 'linear-gradient(125deg, #F5F7FA, #FFFFFF, #F9FAFE, #F5F7FA)',
      animatedBackground: 'linear-gradient(125deg, #E3F2FD, #BBDEFB, #90CAF9, #64B5F6, #42A5F5, #2196F3, #1E88E5, #1976D2, #1565C0, #0D47A1, #1565C0, #1976D2, #42A5F5)',
      heroGradient: 'linear-gradient(135deg, rgba(13, 71, 161, 0.6) 0%, rgba(25, 118, 210, 0.6) 50%, rgba(66, 165, 245, 0.6) 100%)',
      subtle: 'radial-gradient(circle at center, rgba(25, 118, 210, 0.07) 0%, rgba(255, 255, 255, 0) 70%)',
    },
    sidebar: {
      icon: 'rgba(25, 118, 210, 0.9)',       // Blue for icons
      activeIcon: '#1565C0',                 // Darker blue for active icons
      text: 'rgba(0, 0, 0, 0.85)',           // Dark text for better readability
      activeText: '#1565C0',                 // Blue for active text
      hoverBackground: 'rgba(25, 118, 210, 0.08)', // Light blue hover
      activeBackground: 'rgba(25, 118, 210, 0.15)', // Light blue active
      divider: 'rgba(0, 0, 0, 0.1)'          // Slightly darker divider
    },
    chat: {
      userBubble: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
      userBubbleText: '#ffffff',
      botBubble: '#F5F7FA',
      botBubbleText: 'rgba(0, 0, 0, 0.87)',
      botBubbleBorder: 'rgba(0, 0, 0, 0.1)'
    }
  },
  typography: {
    ...commonValues.typography,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1976D2',
      lineHeight: 1.2,
      marginBottom: '0.5rem',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1976D2',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1976D2',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1976D2',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      color: 'rgba(0, 0, 0, 0.75)',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.75)',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.65)',
    }
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1), 0px 1px 1px 0px rgba(0,0,0,0.07), 0px 1px 3px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.1), 0px 2px 2px 0px rgba(0,0,0,0.07), 0px 1px 5px 0px rgba(0,0,0,0.06)',
    '0px 3px 4px -2px rgba(0,0,0,0.1), 0px 3px 3px -2px rgba(0,0,0,0.07), 0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 2px 5px -1px rgba(0,0,0,0.1), 0px 4px 6px 1px rgba(0,0,0,0.07), 0px 2px 9px 0px rgba(0,0,0,0.06)',
    '0px 3px 6px -1px rgba(0,0,0,0.1), 0px 5px 8px 1px rgba(0,0,0,0.07), 0px 1px 14px 0px rgba(0,0,0,0.06)',
    '0px 3px 8px -1px rgba(0,0,0,0.1), 0px 6px 10px 1px rgba(0,0,0,0.07), 0px 1px 18px 0px rgba(0,0,0,0.06)',
    '0px 4px 9px -2px rgba(0,0,0,0.1), 0px 7px 14px 1px rgba(0,0,0,0.07), 0px 2px 16px 1px rgba(0,0,0,0.06)',
    '0px 5px 11px -3px rgba(0,0,0,0.1), 0px 8px 16px 1px rgba(0,0,0,0.07), 0px 3px 14px 2px rgba(0,0,0,0.06)',
    '0px 5px 12px -3px rgba(0,0,0,0.1), 0px 9px 18px 1px rgba(0,0,0,0.07), 0px 3px 16px 2px rgba(0,0,0,0.06)',
    '0px 6px 13px -3px rgba(0,0,0,0.1), 0px 10px 20px 1px rgba(0,0,0,0.07), 0px 4px 17px 2px rgba(0,0,0,0.06)',
    '0px 6px 14px -4px rgba(0,0,0,0.1), 0px 11px 22px 1px rgba(0,0,0,0.07), 0px 5px 18px 3px rgba(0,0,0,0.06)',
    '0px 7px 15px -4px rgba(0,0,0,0.1), 0px 12px 24px 2px rgba(0,0,0,0.07), 0px 5px 20px 3px rgba(0,0,0,0.06)',
    '0px 7px 16px -4px rgba(0,0,0,0.1), 0px 13px 26px 2px rgba(0,0,0,0.07), 0px 5px 22px 4px rgba(0,0,0,0.06)',
    '0px 8px 17px -5px rgba(0,0,0,0.1), 0px 14px 28px 2px rgba(0,0,0,0.07), 0px 6px 24px 4px rgba(0,0,0,0.06)',
    '0px 8px 18px -5px rgba(0,0,0,0.1), 0px 15px 30px 3px rgba(0,0,0,0.07), 0px 6px 26px 5px rgba(0,0,0,0.06)',
    '0px 9px 19px -5px rgba(0,0,0,0.1), 0px 16px 32px 3px rgba(0,0,0,0.07), 0px 7px 28px 5px rgba(0,0,0,0.06)',
    '0px 9px 20px -6px rgba(0,0,0,0.1), 0px 17px 34px 3px rgba(0,0,0,0.07), 0px 7px 30px 6px rgba(0,0,0,0.06)',
    '0px 10px 21px -6px rgba(0,0,0,0.1), 0px 18px 36px 3px rgba(0,0,0,0.07), 0px 8px 32px 6px rgba(0,0,0,0.06)',
    '0px 10px 22px -6px rgba(0,0,0,0.1), 0px 19px 38px 4px rgba(0,0,0,0.07), 0px 8px 34px 7px rgba(0,0,0,0.06)',
    '0px 11px 23px -7px rgba(0,0,0,0.1), 0px 20px 40px 4px rgba(0,0,0,0.07), 0px 9px 36px 7px rgba(0,0,0,0.06)',
    '0px 11px 24px -7px rgba(0,0,0,0.1), 0px 21px 42px 4px rgba(0,0,0,0.07), 0px 9px 38px 8px rgba(0,0,0,0.06)',
    '0px 12px 25px -7px rgba(0,0,0,0.1), 0px 22px 44px 4px rgba(0,0,0,0.07), 0px 10px 40px 8px rgba(0,0,0,0.06)',
    '0px 12px 26px -8px rgba(0,0,0,0.1), 0px 23px 46px 5px rgba(0,0,0,0.07), 0px 10px 42px 9px rgba(0,0,0,0.06)',
    '0px 13px 27px -8px rgba(0,0,0,0.1), 0px 24px 48px 5px rgba(0,0,0,0.07), 0px 11px 44px 9px rgba(0,0,0,0.06)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          ...keyframes,
        },
        'body': {
          background: 'linear-gradient(-45deg, #2196F3, #64B5F6, #90CAF9, #BBDEFB, #E3F2FD)',
          backgroundSize: '400% 400%',
          animation: 'gradientAnimation 20s ease infinite',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#1976D2 #F5F7FA',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F5F7FA',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(25, 118, 210, 0.5)',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
            },
          },
        },
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'rgba(25, 118, 210, 0.9)', // Blue icons for better visibility
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'rgba(0, 0, 0, 0.85)', // Darker text for better readability
        },
      },
    },
    // ... rest of light theme components
  },
});

// Export theme based on mode
const theme = darkTheme;
export default theme;
