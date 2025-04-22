import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Toolbar, Typography, AppBar, Divider, IconButton, Avatar, Badge,
  useMediaQuery, useTheme, Collapse, Fade, Zoom, Tooltip
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, keyframes } from '@mui/material/styles';
import { authService } from '../services/authService';

const drawerWidth = 260;

// Animation keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(156, 39, 176, 0.4); }
  50% { box-shadow: 0 0 15px rgba(156, 39, 176, 0.7), 0 0 30px rgba(156, 39, 176, 0.3); }
  100% { box-shadow: 0 0 5px rgba(156, 39, 176, 0.4); }
`;

// Animated background container
const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: theme.palette.gradients.animatedBackground,
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  opacity: theme.palette.mode === 'dark' ? 0.15 : 0.07,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? 'radial-gradient(circle at 50% 50%, rgba(18, 18, 18, 0.6) 0%, rgba(18, 18, 18, 0.8) 50%, #121212 100%)'
      : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.8) 50%, #F5F7FA 100%)',
    zIndex: 1,
  },
}));

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
  marginLeft: { xs: 0, sm: `${drawerWidth}px` },
  background: theme.palette.gradients.navbar,
  backgroundSize: '300% 300%',
  animation: `${gradientShift} 15s ease infinite`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  backdropFilter: 'blur(10px)',
  borderRadius: '0 0 16px 16px',
  transition: 'all 0.3s ease-in-out',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(to right, #BA68C8, #9C27B0, #673AB7)'
      : 'linear-gradient(to right, #64B5F6, #1976D2, #0D47A1)',
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3, 2),
  background: theme.palette.gradients.sidebarHeader,
  backgroundSize: '200% auto',
  animation: `${gradientShift} 15s ease infinite`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '2px',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(to right, transparent, rgba(156, 39, 176, 0.7), transparent)'
      : 'linear-gradient(to right, transparent, rgba(25, 118, 210, 0.7), transparent)',
  }
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2rem',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #E1BEE7, #BA68C8, #E1BEE7)'
    : 'linear-gradient(45deg, #BBDEFB, #64B5F6, #BBDEFB)',
  backgroundSize: '300% 300%',
  animation: `${gradientShift} 5s ease infinite`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  letterSpacing: '1px',
  filter: theme.palette.mode === 'dark' 
    ? 'drop-shadow(0 0 8px rgba(186, 104, 200, 0.8))'
    : 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.8))',
  textShadow: theme.palette.mode === 'dark'
    ? '0 0 15px rgba(186, 104, 200, 0.6), 0 0 30px rgba(156, 39, 176, 0.4)'
    : '0 0 15px rgba(33, 150, 243, 0.6), 0 0 30px rgba(25, 118, 210, 0.4)',
}));

const Tagline = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  textAlign: 'center',
  letterSpacing: '0.5px',
  textShadow: theme.palette.mode === 'dark'
    ? '0 1px 3px rgba(0, 0, 0, 0.3)'
    : '0 1px 3px rgba(0, 0, 0, 0.4)',
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: 10,
  margin: '8px 6px',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: active 
    ? (theme.palette.mode === 'dark' 
        ? 'rgba(156, 39, 176, 0.15)'
        : 'rgba(25, 118, 210, 0.15)')  
    : 'transparent',
  transition: 'all 0.3s ease',
  '&:before': active ? {
    content: '""',
    position: 'absolute',
    right: 0,
    top: '50%',
    height: '60%',
    width: '4px',
    background: theme.palette.primary.main,
    transform: 'translateY(-50%)',
    borderRadius: '4px 0 0 4px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 8px rgba(156, 39, 176, 0.6)'
      : '0 0 8px rgba(25, 118, 210, 0.6)',
  } : {},
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(156, 39, 176, 0.08)'
      : 'rgba(25, 118, 210, 0.08)',
    transform: 'translateX(-5px)',
    '& .MuiListItemIcon-root': {
      transform: 'scale(1.1)',
    },
  },
}));

const AnimatedListItemIcon = styled(ListItemIcon)(({ theme, active }) => ({
  minWidth: 40,
  color: active 
    ? (theme.palette.mode === 'dark' 
        ? theme.palette.primary.main 
        : theme.palette.primary.dark)
    : (theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.7)'
        : 'rgba(0, 0, 0, 0.6)'),
  transition: 'all 0.3s ease',
}));

const AnimatedListItemText = styled(ListItemText)(({ theme, active }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 400,
    fontSize: '0.95rem',
    color: active 
      ? (theme.palette.mode === 'dark'
          ? theme.palette.primary.light
          : theme.palette.primary.dark)
      : (theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(0, 0, 0, 0.85)'),
    transition: 'all 0.3s ease',
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 46,
  height: 46,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  border: '2px solid rgba(156, 39, 176, 0.5)',
  transition: 'all 0.3s ease',
  animation: `${glow} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
    border: '2px solid rgba(156, 39, 176, 0.8)',
  }
}));

const Layout = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const [userName, setUserName] = useState('');
  
  // Fade-in effect for content
  const [contentVisible, setContentVisible] = useState(false);
  useEffect(() => {
    setContentVisible(false);
    const timer = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUserName(response.user.name);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };
    fetchUserInfo();
  }, [isAuthenticated]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const mainMenuItems = [
    { text: 'الرئيسية', icon: <HomeIcon />, path: '/' },
    { text: 'المساعد الطبي', icon: <ChatIcon />, path: '/chat' },
    { text: 'مستشفيات قريبة', icon: <LocalHospitalIcon />, path: '/hospitals' },
    { text: 'صيدليات قريبة', icon: <MedicationIcon />, path: '/pharmacies' },
    { text: 'مواعيدي', icon: <EventNoteIcon />, path: '/appointments' },
  ];

  const authMenuItems = isAuthenticated 
    ? [
        { text: 'الملف الشخصي', icon: <PersonIcon />, path: '/profile' },
        { text: 'السجل الطبي', icon: <HistoryIcon />, path: '/medical-history' },
      ]
    : [
        { text: 'تسجيل الدخول', icon: <LoginIcon />, path: '/login' },
        { text: 'إنشاء حساب', icon: <PersonAddIcon />, path: '/signup' },
      ];

  const drawer = (
    <>
      <LogoContainer>
        <Logo variant="h1">IPARPA</Logo>
        <Tagline variant="subtitle2">المساعد الطبي الذكي</Tagline>
        
        {isAuthenticated && (
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 2, 
                p: 1.5, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <ProfileAvatar>
                {userName?.charAt(0) || <PersonIcon />}
              </ProfileAvatar>
              <Box sx={{ ml: 1.5 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  {userName || 'مرحبًا بك'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.8rem'
                  }}
                >
                  مستخدم
                </Typography>
              </Box>
            </Box>
          </Zoom>
        )}
      </LogoContainer>
      
      <List sx={{ padding: theme.spacing(2, 1) }}>
        {mainMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Fade key={item.text} in={true} style={{ transitionDelay: `${50 * index}ms` }}>
              <StyledListItem 
                button 
                component={Link} 
                to={item.path}
                active={isActive ? 1 : 0}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <AnimatedListItemIcon 
                  active={isActive ? 1 : 0}
                  sx={{ 
                    animation: isActive ? `${float} 2s ease infinite` : 'none'
                  }}
                >
                  {item.icon}
                </AnimatedListItemIcon>
                <AnimatedListItemText 
                  primary={item.text} 
                  active={isActive ? 1 : 0}
                />
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'radial-gradient(circle at center, rgba(46, 134, 193, 0.08) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </StyledListItem>
            </Fade>
          );
        })}

        <Divider sx={{ my: 2, opacity: 0.6 }} />
        
        {authMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Fade key={item.text} in={true} style={{ transitionDelay: `${200 + (50 * index)}ms` }}>
              <StyledListItem 
                button 
                component={Link} 
                to={item.path}
                active={isActive ? 1 : 0}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <AnimatedListItemIcon active={isActive ? 1 : 0}>
                  {item.icon}
                </AnimatedListItemIcon>
                <AnimatedListItemText 
                  primary={item.text} 
                  active={isActive ? 1 : 0}
                />
              </StyledListItem>
            </Fade>
          );
        })}
      </List>
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        p: 2,
        textAlign: 'center',
        color: 'text.secondary',
        fontSize: '0.75rem',
        opacity: 0.7,
      }}>
        © {new Date().getFullYear()} IPARPA
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* No need for theme toggle button here, it's now globally added in AppTheme */}
      
      <StyledAppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                transform: 'rotate(180deg)',
                transition: 'transform 0.3s ease-in-out',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
              position: 'relative',
              color: '#ffffff',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-6px',
                left: '25%',
                width: '50%',
                height: '2px',
                background: '#fff',
                borderRadius: '2px',
                opacity: 0.7,
              }
            }}
          >
            {title || 'IPARPA - المساعد الطبي الذكي'}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </StyledAppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            },
          }}
          anchor="right"
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: drawerWidth,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: 'none',
            },
          }}
          open
          anchor="right"
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
          background: theme.palette.mode === 'dark'
            ? 'transparent'
            : 'radial-gradient(circle at 50% 0%, rgba(106, 27, 154, 0.05) 0%, rgba(156, 39, 176, 0.08) 50%, rgba(49, 27, 146, 0.03) 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '40%',
            height: '30%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(156, 39, 176, 0.07) 0%, rgba(18, 18, 18, 0) 70%)'
              : 'radial-gradient(circle, rgba(156, 39, 176, 0.07) 0%, rgba(255, 255, 255, 0) 70%)',
            zIndex: -1,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '30%',
            height: '40%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(156, 39, 176, 0.07) 0%, rgba(18, 18, 18, 0) 70%)'
              : 'radial-gradient(circle, rgba(156, 39, 176, 0.07) 0%, rgba(255, 255, 255, 0) 70%)',
            zIndex: -1,
            borderRadius: '50%',
          }
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative',
            pt: 2,
          }}
        >
          <Fade in={contentVisible} timeout={800}>
            <Box>
              {children}
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
