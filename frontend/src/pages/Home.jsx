import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Container, Paper, 
  Divider, Avatar, Fade, Zoom, Grow, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { Layout } from '../components';
import { authService } from '../services/authService';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(156, 39, 176, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(8, 2),
  marginBottom: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  textAlign: 'center',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(74, 20, 140, 0.7) 0%, rgba(123, 31, 162, 0.7) 50%, rgba(156, 39, 176, 0.7) 100%)'
    : 'linear-gradient(135deg, rgba(13, 71, 161, 0.7) 0%, rgba(25, 118, 210, 0.7) 50%, rgba(66, 165, 245, 0.7) 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: theme.palette.mode === 'dark'
      ? 'radial-gradient(circle, rgba(156, 39, 176, 0.4) 0%, rgba(0, 0, 0, 0) 70%)'
      : 'radial-gradient(circle, rgba(25, 118, 210, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
    zIndex: 0,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6, 2),
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  maxWidth: 800,
  margin: '0 auto',
}));

const AnimatedCircle = styled(Box)(({ theme, delay = 0, size = 200, left = '10%', top = '20%', opacity = 0.2 }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(circle, rgba(156, 39, 176, 0.8) 0%, rgba(156, 39, 176, 0) 70%)'
    : 'radial-gradient(circle, rgba(25, 118, 210, 0.8) 0%, rgba(25, 118, 210, 0) 70%)',
  left,
  top,
  opacity,
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 0,
}));

const FeatureCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '16px',
  background: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 20px rgba(0, 0, 0, 0.3)' 
    : '0 8px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-16px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 16px 30px rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.5)`
      : `0 16px 30px rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.2)`,
    '& .MuiCardContent-root': {
      borderTop: `3px solid ${color}`
    },
    '& .feature-icon': {
      transform: 'scale(1.15) rotate(5deg)',
      color: color
    },
    '& .feature-title': {
      color
    }
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  margin: '0 auto 16px',
  background: theme.palette.mode === 'dark' 
    ? `rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.15)`
    : `rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.1)`,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 12px rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.3)`
    : `0 4px 12px rgba(${color === '#2E86C1' ? '46, 134, 193' : color === '#117A65' ? '17, 122, 101' : color === '#8E44AD' ? '142, 68, 173' : '231, 76, 60'}, 0.15)`,
  transition: 'all 0.3s ease',
  transform: 'translateY(0)'
}));

const TestimonialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  margin: theme.spacing(2, 0),
  position: 'relative',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(48, 48, 48, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.3)'
    : '0 10px 30px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 15px 35px rgba(0, 0, 0, 0.4)'
      : '0 15px 35px rgba(0, 0, 0, 0.15)',
  }
}));

const QuoteIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  fontSize: '120px',
  opacity: 0.1,
  fontFamily: 'Georgia, serif',
  top: '-10px',
  right: '20px',
  color: theme.palette.primary.main,
}));

const CTASection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  borderRadius: 16,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #4A148C, #7B1FA2, #9C27B0, #6A1B9A)'
    : 'linear-gradient(45deg, #0D47A1, #1565C0, #1976D2, #0D47A1)',
  backgroundSize: '400% 400%',
  animation: `${gradientMove} 15s ease infinite`,
  marginTop: theme.spacing(8),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 15px 35px rgba(0, 0, 0, 0.4)'
    : '0 15px 35px rgba(0, 0, 0, 0.2)',
}));

const PulseButton = styled(Button)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  marginTop: theme.spacing(3),
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 20px rgba(156, 39, 176, 0.3)'
    : '0 10px 20px rgba(25, 118, 210, 0.3)',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? theme.palette.primary.dark
      : theme.palette.primary.dark,
    animation: 'none'
  }
}));

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const isAuthenticated = authService.isAuthenticated();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
    
    // Trigger animations after a short delay
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const features = [
    {
      title: 'المساعد الطبي',
      description: 'تحدث مع المساعد الطبي الذكي واحصل على إجابات فورية لأسئلتك الصحية. نقدم استشارات مخصصة وإرشادات طبية موثوقة.',
      icon: <ChatIcon fontSize="large" className="feature-icon" sx={{ fontSize: '2.5rem' }} />,
      path: '/chat',
      color: '#2E86C1'
    },
    {
      title: 'مستشفيات قريبة',
      description: 'اعثر على أقرب المستشفيات إلى موقعك الحالي مع معلومات مفصلة عن التخصصات المتوفرة وساعات العمل والتقييمات.',
      icon: <LocalHospitalIcon fontSize="large" className="feature-icon" sx={{ fontSize: '2.5rem' }} />,
      path: '/hospitals',
      color: '#117A65'
    },
    {
      title: 'صيدليات قريبة',
      description: 'تصفح قائمة الصيدليات القريبة منك على الخريطة للعثور على الأدوية التي تحتاجها بسرعة وسهولة.',
      icon: <MedicationIcon fontSize="large" className="feature-icon" sx={{ fontSize: '2.5rem' }} />,
      path: '/pharmacies',
      color: '#8E44AD'
    },
    {
      title: 'مواعيدي',
      description: 'إدارة مواعيدك الطبية بكفاءة مع تنبيهات وتذكيرات قبل الموعد وإمكانية جدولة المواعيد والإلغاء بسهولة.',
      icon: <EventNoteIcon fontSize="large" className="feature-icon" sx={{ fontSize: '2.5rem' }} />,
      path: '/appointments',
      color: '#E74C3C'
    }
  ];

  const testimonials = [
    {
      name: "أحمد محمود",
      role: "مستخدم",
      comment: "ساعدني تطبيق IPARPA على تشخيص حالتي بسرعة والحصول على استشارة طبية فورية دون الحاجة للانتظار في عيادة الطبيب.",
      avatar: "A"
    },
    {
      name: "سارة خالد",
      role: "مستخدمة",
      comment: "الواجهة سهلة الاستخدام والمساعد الطبي الذكي يقدم معلومات دقيقة وموثوقة. أنصح به بشدة للجميع.",
      avatar: "س"
    },
    {
      name: "محمد عبدالله",
      role: "طبيب",
      comment: "رائع للمتابعة مع المرضى. يساعد المرضى على الوصول للرعاية الطبية بسهولة ويوفر معلومات صحية موثوقة.",
      avatar: "م"
    }
  ];

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Zoom in={animate} style={{ transitionDelay: '100ms' }}>
          <HeroSection>
            {/* Animated circles for visual interest */}
            <AnimatedCircle size={300} left="5%" top="10%" delay={1} opacity={0.15} />
            <AnimatedCircle size={200} left="80%" top="60%" delay={1.5} opacity={0.2} />
            <AnimatedCircle size={150} left="20%" top="70%" delay={2} opacity={0.15} />
            
            <HeroContent>
              <Avatar 
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark',
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 0 30px rgba(156, 39, 176, 0.6)' 
                    : '0 0 30px rgba(25, 118, 210, 0.6)',
                  animation: `${float} 3s ease-in-out infinite`
                }}
              >
                <HealthAndSafetyIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography variant="h1" sx={{ 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(to right, #E1BEE7, #FFFFFF, #BA68C8)'
                  : 'linear-gradient(to right, #BBDEFB, #FFFFFF, #64B5F6)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientMove} 5s ease infinite`,
                textShadow: theme.palette.mode === 'dark'
                  ? '0 0 30px rgba(156, 39, 176, 0.8)'
                  : '0 0 30px rgba(25, 118, 210, 0.8)',
              }}>
                IPARPA - مساعدك الطبي الذكي
              </Typography>
              
              {user ? (
                <Typography variant="h5" sx={{ 
                  mb: 4, 
                  color: 'secondary.main',
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  مرحبًا بك {user.name}! نحن هنا لمساعدتك في رحلتك الصحية
                </Typography>
              ) : (
                <Typography variant="h5" sx={{ 
                  mb: 4, 
                  color: '#fff',
                  fontWeight: 500,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  رفيقك الصحي الذكي للإجابة على استفساراتك وتوصيلك بالخدمات الطبية
                </Typography>
              )}

              {!isAuthenticated && (
                <Box sx={{ mb: 4 }}>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    size="large"
                    sx={{ 
                      mx: 1, 
                      px: 3,
                      py: 1.2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={() => navigate('/login')}
                  >
                    تسجيل الدخول
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    size="large"
                    sx={{ 
                      mx: 1,
                      px: 3,
                      py: 1.2,
                      border: '2px solid',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                      }
                    }}
                    onClick={() => navigate('/signup')}
                  >
                    إنشاء حساب
                  </Button>
                </Box>
              )}
              
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/chat')}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(to right, #7B1FA2, #9C27B0)' 
                    : 'linear-gradient(to right, #1565C0, #1976D2)',
                  '&:hover': {
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(to right, #6A1B9A, #7B1FA2)' 
                      : 'linear-gradient(to right, #0D47A1, #1565C0)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
                  }
                }}
              >
                جرب المساعد الذكي الآن
              </Button>
            </HeroContent>
          </HeroSection>
        </Zoom>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Fade in={animate} style={{ transitionDelay: '300ms' }}>
              <Typography variant="h2" sx={{ mb: 2 }}>
                خدماتنا المميزة
              </Typography>
            </Fade>
            <Fade in={animate} style={{ transitionDelay: '400ms' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, maxWidth: 700, mx: 'auto' }}>
                تم تصميم IPARPA لمساعدتك في الحصول على أفضل رعاية صحية بطريقة سهلة وذكية
              </Typography>
            </Fade>
            <Divider sx={{ 
              width: '100px', 
              mx: 'auto', 
              mt: 3, 
              mb: 4, 
              borderWidth: 2,
              borderColor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.main' 
            }} />
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Grow 
                  in={animate} 
                  style={{ 
                    transformOrigin: 'center bottom',
                    transitionDelay: `${500 + (index * 100)}ms`
                  }}
                >
                  <FeatureCard color={feature.color}>
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center', 
                      p: 4
                    }}>
                      <IconWrapper color={feature.color}>
                        {feature.icon}
                      </IconWrapper>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        className="feature-title"
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        onClick={() => navigate(feature.path)}
                        sx={{ 
                          mt: 'auto',
                          borderRadius: '50px', 
                          px: 3,
                          borderColor: feature.color,
                          color: feature.color,
                          '&:hover': {
                            borderColor: feature.color,
                            backgroundColor: `${feature.color}15`,
                          }
                        }}
                      >
                        استخدم الآن
                      </Button>
                    </CardContent>
                  </FeatureCard>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Fade in={animate} style={{ transitionDelay: '900ms' }}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                آراء المستخدمين
              </Typography>
              <Divider sx={{ 
                width: '80px', 
                mx: 'auto', 
                mt: 2, 
                mb: 4, 
                borderWidth: 2,
                borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'secondary.main' 
              }} />
            </Box>
            
            <Grid container spacing={3}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Zoom in={animate} style={{ transitionDelay: `${1000 + (index * 200)}ms` }}>
                    <TestimonialCard elevation={3}>
                      <QuoteIcon>❝</QuoteIcon>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                            mr: 2
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{testimonial.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
                        "{testimonial.comment}"
                      </Typography>
                    </TestimonialCard>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Call to Action */}
        <Fade in={animate} style={{ transitionDelay: '1200ms' }}>
          <CTASection>
            <Typography variant="h3" color="white" sx={{ mb: 2, fontWeight: 700 }}>
              ابدأ رحلتك الصحية الآن
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
              استشر المساعد الطبي الذكي واحصل على إجابات لأسئلتك الصحية بشكل فوري
            </Typography>
            <PulseButton 
              variant="contained" 
              color="secondary"
              size="large"
              onClick={() => navigate('/chat')}
            >
              ابدأ محادثة الآن
            </PulseButton>
          </CTASection>
        </Fade>
      </Container>
    </Layout>
  );
};

export default Home;
