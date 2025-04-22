import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!formData.password) {
      setError('كلمة المرور مطلوبة');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.login(formData);
      
      if (response.success) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message ||
        'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="تسجيل الدخول">
      <Box sx={{ maxWidth: 500, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="primary" sx={{ mb: 4 }}>
            تسجيل الدخول
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="البريد الإلكتروني"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
            />
            
            <TextField
              label="كلمة المرور"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              type="password"
              placeholder="أدخل كلمة المرور"
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'تسجيل الدخول'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                ليس لديك حساب؟{' '}
                <Link to="/signup" style={{ color: '#2E86C1', textDecoration: 'none' }}>
                  إنشاء حساب جديد
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Login;
