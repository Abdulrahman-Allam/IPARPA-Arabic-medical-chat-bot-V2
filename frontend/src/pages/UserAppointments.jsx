import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Card, CardContent, Grid, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Divider,
  Grow, Zoom, Fade, Slide, useTheme, Avatar, Tooltip, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Layout } from '../components';
import { appointmentService } from '../services/api';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: theme.palette.mode === 'dark'
    ? theme.palette.gradients.purpleMild
    : theme.palette.gradients.blueMild,
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 15s ease infinite`,
  color: 'white',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    width: '60px',
    background: theme.palette.mode === 'dark'
      ? theme.palette.primary.main
      : theme.palette.primary.main,
    borderRadius: '5px',
  }
}));

const AppointmentCard = styled(Card)(({ theme, status }) => {
  let statusColor;
  switch (status) {
    case 'confirmed': statusColor = '#117A65'; break;
    case 'pending': statusColor = '#F39C12'; break;
    case 'cancelled': statusColor = '#C0392B'; break;
    case 'completed': statusColor = '#2471A3'; break;
    default: statusColor = '#7F8C8D';
  }
  
  return {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.08)'}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 20px rgba(0, 0, 0, 0.3)'
      : '0 8px 20px rgba(0, 0, 0, 0.06)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: `0 12px 28px rgba(${theme.palette.mode === 'dark' 
        ? '0, 0, 0, 0.4'
        : '0, 0, 0, 0.15'})`,
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.15)'
        : `rgba(${statusColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.4)`
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      backgroundColor: statusColor,
    }
  };
});

const CardHeader = styled(Box)(({ theme, status }) => {
  let bgColor;
  switch (status) {
    case 'confirmed': bgColor = theme.palette.mode === 'dark' ? 'rgba(17, 122, 101, 0.1)' : 'rgba(17, 122, 101, 0.05)'; break;
    case 'pending': bgColor = theme.palette.mode === 'dark' ? 'rgba(243, 156, 18, 0.1)' : 'rgba(243, 156, 18, 0.05)'; break;
    case 'cancelled': bgColor = theme.palette.mode === 'dark' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(192, 57, 43, 0.05)'; break;
    case 'completed': bgColor = theme.palette.mode === 'dark' ? 'rgba(36, 113, 163, 0.1)' : 'rgba(36, 113, 163, 0.05)'; break;
    default: bgColor = theme.palette.mode === 'dark' ? 'rgba(127, 140, 141, 0.1)' : 'rgba(127, 140, 141, 0.05)';
  }
  
  return {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    backgroundColor: bgColor,
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  let statusColor;
  switch (status) {
    case 'confirmed': statusColor = '#117A65'; break;
    case 'pending': statusColor = '#F39C12'; break;
    case 'cancelled': statusColor = '#C0392B'; break;
    case 'completed': statusColor = '#2471A3'; break;
    default: statusColor = '#7F8C8D';
  }
  
  return {
    fontWeight: 'bold',
    backgroundColor: statusColor,
    color: 'white',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 3px 6px rgba(0, 0, 0, 0.16)`
      : `0 3px 6px rgba(${statusColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.2)`,
  };
});

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

const CircularIconContainer = styled(Box)(({ theme, color }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? `rgba(${color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.15)`
    : `rgba(${color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.1)`,
}));

const DialogStyled = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 30, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 25px 50px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px rgba(0, 0, 0, 0.1)',
  }
}));

const DialogHeaderGradient = styled(DialogTitle)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? theme.palette.gradients.purpleMild
    : theme.palette.gradients.blueMild,
  color: 'white',
  padding: theme.spacing(3),
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 15s ease infinite`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
  }
}));

const AnimatedCircle = styled(Box)(({ theme, delay = 0, size = 150, left = '10%', top = '20%', opacity = 0.05 }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(circle, rgba(156, 39, 176, 0.3) 0%, rgba(156, 39, 176, 0) 70%)'
    : 'radial-gradient(circle, rgba(25, 118, 210, 0.3) 0%, rgba(25, 118, 210, 0) 70%)',
  left,
  top,
  opacity,
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 0,
}));

const NoAppointmentsBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: '20px',
  background: theme.palette.mode === 'dark'
    ? 'rgba(38, 38, 38, 0.7)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(255, 255, 255, 0.5)',
  position: 'relative',
  overflow: 'hidden',
}));

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchAppointments();

    // Trigger animations after a short delay
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentService.getUserAppointments();
      
      if (response.success) {
        console.log("Received appointments data:", response.appointments); // Debug
        
        // Process appointments to ensure consistent format
        const processedAppointments = (response.appointments || []).map(app => {
          // Ensure consistent structure for both types of appointments
          if (!app.status) app.status = 'pending'; // Set default status if missing
          
          // Handle appointments without a schedule object (SMS bookings)
          if (!app.schedule && app.specialty) {
            app.schedule = {
              specialty: app.specialty,
              // Add other default values if needed
            };
          }
          
          return app;
        });
        
        setAppointments(processedAppointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError('فشل في الحصول على المواعيد الخاصة بك. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCancelling(true);
      const response = await appointmentService.cancelAppointment(selectedAppointment._id);
      
      if (response.success) {
        setSuccess('تم إلغاء الموعد بنجاح');
        // Remove the cancelled appointment from the list
        setAppointments(appointments.filter(app => app._id !== selectedAppointment._id));
        handleCloseCancelDialog();
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError('فشل في إلغاء الموعد. يرجى المحاولة مرة أخرى.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#117A65';
      case 'pending': return '#F39C12';
      case 'cancelled': return '#C0392B';
      case 'completed': return '#2471A3';
      default: return '#7F8C8D';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      case 'completed': return 'مكتمل';
      default: return 'غير معروف';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon sx={{ color: '#117A65' }} />;
      case 'pending': return <PendingIcon sx={{ color: '#F39C12' }} />;
      case 'cancelled': return <CancelIcon sx={{ color: '#C0392B' }} />;
      case 'completed': return <EventNoteIcon sx={{ color: '#2471A3' }} />;
      default: return <EventIcon sx={{ color: '#7F8C8D' }} />;
    }
  };

  // Group appointments by status
  const groupedAppointments = {
    confirmed: appointments.filter(app => app.status === 'confirmed'),
    pending: appointments.filter(app => app.status === 'pending'),
    other: appointments.filter(app => app.status !== 'confirmed' && app.status !== 'pending')
  };

  return (
    <Layout title="مواعيدي">
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Zoom in={animate} timeout={800}>
          <HeaderPaper>
            {/* Animated background circles */}
            <AnimatedCircle size={200} left="5%" top="10%" delay={0.2} opacity={0.06} />
            <AnimatedCircle size={150} left="80%" top="50%" delay={1.5} opacity={0.08} />
            <AnimatedCircle size={120} left="30%" top="70%" delay={0.8} opacity={0.06} />
            
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Avatar 
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 0 20px rgba(156, 39, 176, 0.5)' 
                    : '0 0 20px rgba(25, 118, 210, 0.5)',
                  animation: `${float} 3s ease-in-out infinite`
                }}
              >
                <EventIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                مواعيدي
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
                يمكنك هنا متابعة وإدارة جميع مواعيدك الطبية
              </Typography>
            </Box>
          </HeaderPaper>
        </Zoom>

        {success && (
          <Slide direction="down" in={true}>
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: '10px', boxShadow: 2 }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </Slide>
        )}

        {error && (
          <Slide direction="down" in={true}>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '10px', boxShadow: 2 }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Slide>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              جاري تحميل المواعيد...
            </Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Fade in={animate} timeout={1000} style={{ transitionDelay: '300ms' }}>
            <NoAppointmentsBox>
              <Box sx={{ mb: 3 }}>
                <Avatar 
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.1)',
                    width: 100,
                    height: 100,
                    margin: '0 auto 16px',
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 50, color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main' }} />
                </Avatar>
              </Box>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                ليس لديك أي مواعيد حتى الآن
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                يمكنك حجز موعد جديد من خلال المساعد الطبي الذكي
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = '/chat'}
                sx={{ 
                  borderRadius: '30px', 
                  py: 1.2, 
                  px: 4,
                  fontWeight: 'bold',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(156, 39, 176, 0.3)'
                    : '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 6px 25px rgba(156, 39, 176, 0.4)'
                      : '0 6px 25px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                حجز موعد جديد
              </Button>
            </NoAppointmentsBox>
          </Fade>
        ) : (
          <>
            {/* Confirmed Appointments */}
            {groupedAppointments.confirmed.length > 0 && (
              <Fade in={animate} timeout={1000} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ mb: 5 }}>
                  <SectionTitle variant="h4" sx={{ color: '#117A65', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} /> المواعيد المؤكدة
                  </SectionTitle>
                  <Grid container spacing={3}>
                    {groupedAppointments.confirmed.map((appointment, index) => (
                      <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                        <Grow 
                          in={animate} 
                          style={{ 
                            transformOrigin: 'center top',
                            transitionDelay: `${300 + (index * 100)}ms`
                          }}
                        >
                          <AppointmentCard status="confirmed">
                            <CardHeader status="confirmed">
                              <StatusChip
                                status="confirmed"
                                label={getStatusText(appointment.status)}
                                icon={getStatusIcon(appointment.status)}
                                size="small"
                              />
                              <Typography variant="caption" sx={{ ml: 'auto' }}>
                                رقم الموعد: {appointment._id.substring(0, 8)}
                              </Typography>
                            </CardHeader>
                            <CardContent sx={{ pt: 0 }}>
                              <InfoItem>
                                <CircularIconContainer color="#1976D2">
                                  <LocalHospitalIcon fontSize="small" sx={{ color: '#1976D2' }} />
                                </CircularIconContainer>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    د. {appointment.schedule.doctorName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.schedule.specialty}
                                  </Typography>
                                </Box>
                              </InfoItem>
                              
                              <InfoItem>
                                <CircularIconContainer color="#9C27B0">
                                  <EventIcon fontSize="small" sx={{ color: '#9C27B0' }} />
                                </CircularIconContainer>
                                <Typography variant="body2">
                                  {formatDate(appointment.schedule.appointmentDate)}
                                </Typography>
                              </InfoItem>
                              
                              <InfoItem>
                                <CircularIconContainer color="#FF9800">
                                  <AccessTimeIcon fontSize="small" sx={{ color: '#FF9800' }} />
                                </CircularIconContainer>
                                <Typography variant="body2">
                                  {appointment.schedule.startTime}
                                </Typography>
                              </InfoItem>
                              
                              <InfoItem>
                                <CircularIconContainer color="#F44336">
                                  <LocationOnIcon fontSize="small" sx={{ color: '#F44336' }} />
                                </CircularIconContainer>
                                <Typography variant="body2">
                                  {appointment.schedule.location}
                                </Typography>
                              </InfoItem>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleOpenCancelDialog(appointment)}
                                  fullWidth
                                  sx={{
                                    borderRadius: '10px',
                                    py: 1,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 8px rgba(192, 57, 43, 0.3)'
                                    }
                                  }}
                                >
                                  إلغاء الموعد
                                </Button>
                              )}
                            </CardContent>
                          </AppointmentCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}
            
            {/* Pending Appointments */}
            {groupedAppointments.pending.length > 0 && (
              <Fade in={animate} timeout={1000} style={{ transitionDelay: '400ms' }}>
                <Box sx={{ mb: 5 }}>
                  <SectionTitle variant="h4" sx={{ color: '#F39C12', display: 'flex', alignItems: 'center' }}>
                    <PendingIcon sx={{ mr: 1 }} /> مواعيد قيد الانتظار
                  </SectionTitle>
                  <Grid container spacing={3}>
                    {groupedAppointments.pending.map((appointment, index) => (
                      <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                        <Grow 
                          in={animate} 
                          style={{ 
                            transformOrigin: 'center top',
                            transitionDelay: `${500 + (index * 100)}ms`
                          }}
                        >
                          <AppointmentCard status="pending">
                            <CardHeader status="pending">
                              <StatusChip
                                status="pending"
                                label={getStatusText(appointment.status)}
                                icon={getStatusIcon(appointment.status)}
                                size="small"
                              />
                              <Typography variant="caption" sx={{ ml: 'auto' }}>
                                رقم الطلب: {appointment._id.substring(0, 8)}
                              </Typography>
                            </CardHeader>
                            <CardContent sx={{ pt: 0 }}>
                              <InfoItem>
                                <CircularIconContainer color="#5E35B1">
                                  <PersonIcon fontSize="small" sx={{ color: '#5E35B1' }} />
                                </CircularIconContainer>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {appointment.patient?.name || appointment.name || 'غير محدد'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.schedule?.specialty || appointment.specialty || 'غير محدد'}
                                  </Typography>
                                </Box>
                              </InfoItem>
                              
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2, 
                                  mt: 2, 
                                  mb: 2, 
                                  borderRadius: '10px', 
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.03)' 
                                    : 'rgba(243, 156, 18, 0.05)'
                                }}
                              >
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: theme.palette.mode === 'dark' ? '#F39C12' : '#D35400' }}>
                                  حالة الطلب:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  تم استلام طلبك وسيتم التواصل معك قريبًا لتحديد الموعد المناسب
                                </Typography>
                              </Paper>
                              
                              {appointment.notes && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    الملاحظات:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.notes.substring(0, 100)}
                                    {appointment.notes.length > 100 ? '...' : ''}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Divider sx={{ my: 2 }} />
                              
                              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleOpenCancelDialog(appointment)}
                                  fullWidth
                                  sx={{
                                    borderRadius: '10px',
                                    py: 1,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 8px rgba(192, 57, 43, 0.3)'
                                    }
                                  }}
                                >
                                  إلغاء الطلب
                                </Button>
                              )}
                            </CardContent>
                          </AppointmentCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}
            
            {/* Other Appointments (Cancelled/Completed) */}
            {groupedAppointments.other.length > 0 && (
              <Fade in={animate} timeout={1000} style={{ transitionDelay: '600ms' }}>
                <Box>
                  <SectionTitle variant="h4" sx={{ color: '#7F8C8D', display: 'flex', alignItems: 'center' }}>
                    <EventNoteIcon sx={{ mr: 1 }} /> مواعيد سابقة
                  </SectionTitle>
                  <Grid container spacing={3}>
                    {groupedAppointments.other.map((appointment, index) => (
                      <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                        <Grow 
                          in={animate} 
                          style={{ 
                            transformOrigin: 'center top',
                            transitionDelay: `${700 + (index * 100)}ms`
                          }}
                        >
                          <AppointmentCard status={appointment.status}>
                            <CardHeader status={appointment.status}>
                              <StatusChip
                                status={appointment.status}
                                label={getStatusText(appointment.status)}
                                icon={getStatusIcon(appointment.status)}
                                size="small"
                              />
                              <Typography variant="caption" sx={{ ml: 'auto' }}>
                                رقم الموعد: {appointment._id.substring(0, 8)}
                              </Typography>
                            </CardHeader>
                            <CardContent sx={{ pt: 0 }}>
                              <InfoItem>
                                <CircularIconContainer color={getStatusColor(appointment.status)}>
                                  <LocalHospitalIcon fontSize="small" sx={{ color: getStatusColor(appointment.status) }} />
                                </CircularIconContainer>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    د. {appointment.schedule?.doctorName || 'غير محدد'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.schedule?.specialty || 'غير محدد'}
                                  </Typography>
                                </Box>
                              </InfoItem>
                              
                              {appointment.schedule?.appointmentDate && (
                                <InfoItem>
                                  <CircularIconContainer color="#7986CB">
                                    <EventIcon fontSize="small" sx={{ color: '#7986CB' }} />
                                  </CircularIconContainer>
                                  <Typography variant="body2">
                                    {formatDate(appointment.schedule.appointmentDate)}
                                  </Typography>
                                </InfoItem>
                              )}
                              
                              {appointment.schedule?.startTime && (
                                <InfoItem>
                                  <CircularIconContainer color="#78909C">
                                    <AccessTimeIcon fontSize="small" sx={{ color: '#78909C' }} />
                                  </CircularIconContainer>
                                  <Typography variant="body2">
                                    {appointment.schedule.startTime}
                                  </Typography>
                                </InfoItem>
                              )}
                              
                              {appointment.schedule?.location && (
                                <InfoItem>
                                  <CircularIconContainer color="#90A4AE">
                                    <LocationOnIcon fontSize="small" sx={{ color: '#90A4AE' }} />
                                  </CircularIconContainer>
                                  <Typography variant="body2">
                                    {appointment.schedule.location}
                                  </Typography>
                                </InfoItem>
                              )}
                            </CardContent>
                          </AppointmentCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}
          </>
        )}
      </Box>

      {/* Cancel Appointment Dialog */}
      <DialogStyled open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm">
        <DialogHeaderGradient>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CancelIcon sx={{ mr: 1 }} />
            <Typography variant="h6">تأكيد إلغاء الموعد</Typography>
          </Box>
        </DialogHeaderGradient>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟
            </Typography>
            
            {selectedAppointment && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px', mb: 2 }}>
                {selectedAppointment.schedule?.doctorName && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>الطبيب:</strong> د. {selectedAppointment.schedule.doctorName}
                  </Typography>
                )}
                
                {selectedAppointment.schedule?.specialty && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>التخصص:</strong> {selectedAppointment.schedule.specialty}
                  </Typography>
                )}
                
                {selectedAppointment.schedule?.appointmentDate && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>الموعد:</strong> {formatDate(selectedAppointment.schedule.appointmentDate)}
                    {selectedAppointment.schedule.startTime && ` - ${selectedAppointment.schedule.startTime}`}
                  </Typography>
                )}
              </Paper>
            )}
            
            {selectedAppointment && selectedAppointment.status === 'confirmed' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ملاحظة: قد يتم تطبيق سياسة الإلغاء وفقاً لسياسة العيادة.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseCancelDialog} 
            disabled={cancelling}
            variant="outlined"
            sx={{ borderRadius: '10px' }}
          >
            تراجع
          </Button>
          <Button 
            onClick={handleCancelAppointment} 
            color="error" 
            variant="contained" 
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
            sx={{ 
              borderRadius: '10px',
              boxShadow: '0 3px 8px rgba(192, 57, 43, 0.3)'
            }}
          >
            {cancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </Button>
        </DialogActions>
      </DialogStyled>
    </Layout>
  );
};

export default UserAppointments;
