import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, 
  ListItemIcon, ListItemText, Container, Avatar, Tooltip, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import { authService } from '../../services/authService';

const drawerWidth = 240;

// Animation keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const mainMenuItems = [
    {
      text: 'لوحة التحكم',
      icon: <DashboardIcon />,
      path: '/admin'
    },
    {
      text: 'مواعيد الأطباء',
      icon: <EventNoteIcon />,
      path: '/admin/schedules'
    },
    {
      text: 'المستخدمين',
      icon: <PeopleIcon />,
      path: '/admin/users'
    },
    {
      text: 'الحجوزات',
      icon: <LocalHospitalIcon />,
      path: '/admin/appointments'
    }
  ];

  const drawer = (
    <div>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        my: 2,
        background: theme.palette.gradients.sidebarHeader,
        py: 3,
        width: '100%'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold', 
          color: '#ffffff',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          IPARPA Admin
        </Typography>
      </Box>
      <Divider />
      <List sx={{ my: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(156, 39, 176, 0.08)'
                  : 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{
              color: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.7)'
                : theme.palette.sidebar.icon
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                color: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.85)'
                  : theme.palette.sidebar.text
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ my: 1 }}>
        <ListItem 
          button 
          onClick={() => navigate('/')}
          sx={{
            borderRadius: 1,
            mx: 1,
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(156, 39, 176, 0.08)'
                : 'rgba(25, 118, 210, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{
            color: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.7)'
              : theme.palette.sidebar.icon
          }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="الرئيسية"
            sx={{
              color: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.85)'
                : theme.palette.sidebar.text
            }} 
          />
        </ListItem>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            mx: 1,
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(156, 39, 176, 0.08)'
                : 'rgba(25, 118, 210, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{
            color: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.7)'
              : theme.palette.sidebar.icon
          }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="تسجيل الخروج"
            sx={{
              color: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.85)'
                : theme.palette.sidebar.text
            }} 
          />
        </ListItem>
      </List>
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        p: 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        opacity: 0.7,
      }}>
        © {new Date().getFullYear()} IPARPA Admin
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Animated background */}
      <AnimatedBackground />

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mr: { sm: `${drawerWidth}px` },
          background: theme.palette.gradients.navbar,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          backgroundSize: '200% auto',
          animation: `${gradientShift} 15s ease infinite`,
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
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1,
            color: '#ffffff'
          }}>
            {title || 'لوحة التحكم'}
          </Typography>
          <div>
            <Tooltip title="الحساب">
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ bgcolor: '#1A5276', width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/'); }}>الصفحة الرئيسية</MenuItem>
              <MenuItem onClick={handleLogout}>تسجيل الخروج</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)'
                : theme.palette.gradients.sidebarBody,
              borderRight: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)'
                : theme.palette.gradients.sidebarBody,
              borderRight: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: 'radial-gradient(circle at 50% 0%, rgba(106, 27, 154, 0.4) 0%, rgba(156, 39, 176, 0.2) 50%, rgba(49, 27, 146, 0.1) 100%)',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
