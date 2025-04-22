import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Grid, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { Layout } from '../components';
import { authService } from '../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const response = await authService.getCurrentUser();
        
        if (response.success) {
          setUser(response.user);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('فشل في الحصول على بيانات المستخدم');
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          authService.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout title="الملف الشخصي">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="الملف الشخصي">
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="الملف الشخصي">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', mb: 2 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" color="primary">
              {user?.name}
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  البريد الإلكتروني
                </Typography>
                <Typography variant="body1">{user?.email}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  العمر
                </Typography>
                <Typography variant="body1">{user?.age} سنة</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  رقم الهاتف
                </Typography>
                <Typography variant="body1">{user?.phone}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  تاريخ التسجيل
                </Typography>
                <Typography variant="body1">
                  {new Date(user?.createdAt).toLocaleDateString('ar-EG')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
            >
              تسجيل الخروج
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Profile;
