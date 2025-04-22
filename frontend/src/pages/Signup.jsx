import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components';
import { authService } from '../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone numbers, ensure proper Egyptian mobile format
    if (name === 'phone') {
      let phoneNumber = value.replace(/\D/g, ''); // Remove non-digits
      
      // If user includes leading zeros (e.g., starts with 01), keep that format
      // In backend, we'll add +20 prefix or handle as needed
      if (phoneNumber.length > 0) {
        // If user didn't start with 0, add it
        if (!phoneNumber.startsWith('0')) {
          phoneNumber = '0' + phoneNumber;
        }
        
        // Limit to 11 digits (standard Egyptian mobile length with leading 0)
        phoneNumber = phoneNumber.slice(0, 11);
      }
      
      setFormData(prev => ({ ...prev, [name]: phoneNumber }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('الاسم مطلوب');
      return false;
    }
    if (!formData.age) {
      setError('العمر مطلوب');
      return false;
    }
    if (!formData.email) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }
    if (!formData.phone) {
      setError('رقم الهاتف مطلوب');
      return false;
    }
    // Update validation for Egyptian phone number format (should start with 01 and be 11 digits)
    if (!/^01[0125][0-9]{8}$/.test(formData.phone)) {
      setError('رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
      return false;
    }
    if (!formData.password) {
      setError('كلمة المرور مطلوبة');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
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
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      
      const response = await authService.signup(userData);
      
      if (response.success) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(
        error.response?.data?.message ||
        'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="إنشاء حساب جديد">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="primary" sx={{ mb: 4 }}>
            إنشاء حساب جديد
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="الاسم"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="أدخل اسمك الكامل"
            />
            
            <TextField
              label="العمر"
              name="age"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
              placeholder="أدخل عمرك"
            />
            
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
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="مثال: 01xxxxxxxxx"
              inputProps={{ maxLength: 11 }}
              helperText="أدخل رقم هاتفك المصري المكون من 11 رقم يبدأ بـ 01"
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
            
            <TextField
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              type="password"
              placeholder="أدخل كلمة المرور مرة أخرى"
              error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
              helperText={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword ? "كلمة المرور غير متطابقة" : ""}
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
              {loading ? <CircularProgress size={24} /> : 'إنشاء حساب'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" style={{ color: '#2E86C1', textDecoration: 'none' }}>
                  تسجيل الدخول
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Signup;
