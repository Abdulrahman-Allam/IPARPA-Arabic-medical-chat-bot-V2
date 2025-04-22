import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { Layout } from '../components';
import { appointmentService } from '../services/api';

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const specialties = ["عظام", "قلب", "جراحة", "عيون", "باطنة", "أطفال", "جهاز هضمي", "جلدية", "أسنان", "نساء وتوليد", "مخ و اعصاب", "أنف وأذن وحنجرة", "مسالك بولية", "غدد صماء", "طب نفسي"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.age || !formData.phone || !formData.specialty) {
      setError("من فضلك أدخل كل البيانات المطلوبة");
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await appointmentService.bookAppointment(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          age: '',
          phone: '',
          specialty: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء حجز الموعد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="حجز موعد">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="primary" sx={{ mb: 4 }}>
            احجز مع دكتور
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                تم استلام بياناتك بنجاح!
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                <strong>الاسم:</strong> {formData.name}<br />
                <strong>السن:</strong> {formData.age}<br />
                <strong>رقم التليفون:</strong> {formData.phone}<br />
                <strong>التخصص:</strong> {formData.specialty}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="اسمك"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="أدخل اسمك هنا"
            />
            
            <TextField
              label="سنك"
              name="age"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
            />
            
            <TextField
              label="رقم تليفونك"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder="أدخل رقم هاتفك هنا"
            />
            
            <TextField
              select
              label="اختار التخصص اللي محتاجه"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
            >
              {specialties.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'احجز'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Booking;
