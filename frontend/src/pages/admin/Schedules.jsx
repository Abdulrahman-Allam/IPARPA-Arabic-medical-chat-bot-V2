import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
  FormControl, InputLabel, Select, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdminLayout } from '../../components/admin';
import { adminService } from '../../services/adminService';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const specialties = ["عظام", "قلب", "جراحة", "عيون", "باطنة", "أطفال", "جهاز هضمي", "جلدية", "أسنان", "نساء وتوليد", "مخ و اعصاب", "أنف وأذن وحنجرة", "مسالك بولية", "غدد صماء", "طب نفسي"];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSchedules();
      if (response.success) {
        setSchedules(response.schedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('حدث خطأ أثناء جلب المواعيد');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      doctorName: '',
      specialty: '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    });
    setIsEditing(false);
    setCurrentSchedule(null);
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      // Format date for the input field (YYYY-MM-DD)
      const appointmentDate = new Date(schedule.appointmentDate)
        .toISOString().split('T')[0];
      
      setFormData({
        doctorName: schedule.doctorName,
        specialty: schedule.specialty,
        appointmentDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        notes: schedule.notes || ''
      });
      setIsEditing(true);
      setCurrentSchedule(schedule);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
    setError('');
  };

  const handleOpenDeleteDialog = (schedule) => {
    setCurrentSchedule(schedule);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentSchedule(null);
  };

  const validateForm = () => {
    if (!formData.doctorName) {
      setError('اسم الطبيب مطلوب');
      return false;
    }
    if (!formData.specialty) {
      setError('التخصص مطلوب');
      return false;
    }
    if (!formData.appointmentDate) {
      setError('تاريخ الموعد مطلوب');
      return false;
    }
    if (!formData.startTime) {
      setError('وقت بدء الموعد مطلوب');
      return false;
    }
    if (!formData.endTime) {
      setError('وقت انتهاء الموعد مطلوب');
      return false;
    }
    if (!formData.location) {
      setError('المكان مطلوب');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setError('');
      setSuccess('');
      
      if (isEditing && currentSchedule) {
        const response = await adminService.updateSchedule(currentSchedule._id, formData);
        if (response.success) {
          setSuccess('تم تحديث الموعد بنجاح');
          fetchSchedules();
          handleCloseDialog();
        }
      } else {
        const response = await adminService.createSchedule(formData);
        if (response.success) {
          setSuccess('تم إضافة الموعد بنجاح');
          fetchSchedules();
          handleCloseDialog();
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء حفظ الموعد');
    }
  };

  const handleDelete = async () => {
    if (!currentSchedule) return;

    try {
      setError('');
      const response = await adminService.deleteSchedule(currentSchedule._id);
      if (response.success) {
        setSuccess('تم حذف الموعد بنجاح');
        fetchSchedules();
        handleCloseDeleteDialog();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء حذف الموعد');
      handleCloseDeleteDialog();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout title="إدارة مواعيد الأطباء">
      <Box sx={{ p: 2 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" color="primary">
            مواعيد الأطباء
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            إضافة موعد جديد
          </Button>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : schedules.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد مواعيد مضافة بعد
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الطبيب</TableCell>
                  <TableCell>التخصص</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الوقت</TableCell>
                  <TableCell>المكان</TableCell>
                  <TableCell>متاح</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell>{schedule.doctorName}</TableCell>
                    <TableCell>{schedule.specialty}</TableCell>
                    <TableCell>{formatDate(schedule.appointmentDate)}</TableCell>
                    <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
                    <TableCell>{schedule.location}</TableCell>
                    <TableCell>{schedule.available ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenDialog(schedule)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(schedule)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'تعديل موعد' : 'إضافة موعد جديد'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="اسم الطبيب"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>التخصص</InputLabel>
                <Select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  label="التخصص"
                >
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="تاريخ الموعد"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="وقت البدء"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="وقت الانتهاء"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="المكان"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ملاحظات"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف موعد الدكتور {currentSchedule?.doctorName}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">إلغاء</Button>
          <Button onClick={handleDelete} color="error" variant="contained">حذف</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSchedules;
