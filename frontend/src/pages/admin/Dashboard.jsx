import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin';
import { authService } from '../../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success) {
          if (response.user.role !== 'admin') {
            // Not an admin, redirect to home
            navigate('/');
            return;
          }
          setUser(response.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <AdminLayout title="لوحة التحكم">جاري التحميل...</AdminLayout>;
  }

  const menuItems = [
    {
      title: 'إدارة مواعيد الأطباء',
      description: 'إضافة وتعديل وحذف مواعيد الأطباء المتاحة',
      icon: <EventNoteIcon fontSize="large" color="primary" />,
      path: '/admin/schedules'
    },
    {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة حسابات المستخدمين',
      icon: <PeopleIcon fontSize="large" color="secondary" />,
      path: '/admin/users'
    },
    {
      title: 'إدارة الحجوزات',
      description: 'عرض وإدارة الحجوزات المقدمة من المستخدمين',
      icon: <LocalHospitalIcon fontSize="large" sx={{ color: 'success.main' }} />,
      path: '/admin/appointments'
    }
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      <Box sx={{ p: 2 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            مرحباً بك في لوحة تحكم الإدارة
          </Typography>
          <Typography variant="body1">
            يمكنك من هنا إدارة جميع جوانب النظام بما في ذلك مواعيد الأطباء وحسابات المستخدمين والحجوزات.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {item.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(item.path)} 
                    sx={{ mt: 'auto' }}
                  >
                    الذهاب
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
