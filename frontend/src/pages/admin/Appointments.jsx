import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { AdminLayout } from '../../components/admin';
import { adminService } from '../../services/adminService';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [availableDoctorSchedules, setAvailableDoctorSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');

  const specialties = ["الكل", "عظام", "قلب", "جراحة", "عيون", "باطنة", "أطفال", "جهاز هضمي", "جلدية", "أسنان", "نساء وتوليد", "مخ و اعصاب", "أنف وأذن وحنجرة", "مسالك بولية", "غدد صماء", "طب نفسي"];
  
  const statusOptions = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'confirmed', label: 'محجوز' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'completed', label: 'مكتمل' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAppointments();
      if (response.success) {
        setAppointments(response.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('حدث خطأ أثناء جلب المواعيد');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewDialog = (appointment) => {
    setCurrentAppointment(appointment);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentAppointment(null);
  };

  const handleOpenDeleteDialog = (appointment) => {
    setCurrentAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentAppointment(null);
  };

  const handleOpenStatusDialog = (appointment) => {
    setCurrentAppointment(appointment);
    setSelectedStatus(appointment.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCurrentAppointment(null);
    setSelectedStatus('');
  };

  // Open assign dialog for pending appointments
  const handleOpenAssignDialog = async (appointment) => {
    setCurrentAppointment(appointment);
    setSelectedSchedule('');
    setError('');
    setOpenAssignDialog(true);
    
    try {
      setLoadingSchedules(true);
      const response = await adminService.getAvailableSchedulesForAssignment(appointment.schedule.specialty);
      if (response.success) {
        setAvailableDoctorSchedules(response.schedules || []);
      } else {
        setError('فشل في الحصول على المواعيد المتاحة');
      }
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      setError('فشل في الحصول على المواعيد المتاحة');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setCurrentAppointment(null);
    setSelectedSchedule('');
    setAvailableDoctorSchedules([]);
  };

  const handleDeleteAppointment = async () => {
    if (!currentAppointment) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await adminService.deleteAppointment(currentAppointment._id);
      if (response.success) {
        setSuccess('تم حذف الموعد بنجاح');
        fetchAppointments();
        handleCloseDeleteDialog();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء حذف الموعد');
      handleCloseDeleteDialog();
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentAppointment || !selectedStatus) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await adminService.updateAppointmentStatus(
        currentAppointment._id, 
        { status: selectedStatus }
      );
      
      if (response.success) {
        setSuccess(`تم تحديث حالة الموعد بنجاح من "${getStatusLabel(response.previousStatus)}" إلى "${getStatusLabel(selectedStatus)}"`);
        fetchAppointments();
        handleCloseStatusDialog();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الموعد');
    }
  };

  const handleAssignAppointment = async () => {
    if (!currentAppointment || !selectedSchedule) {
      setError('يرجى اختيار موعد للطبيب');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await adminService.assignAppointmentToDoctor(
        currentAppointment._id,
        selectedSchedule
      );
      
      if (response.success) {
        setSuccess('تم تعيين الموعد للطبيب بنجاح');
        fetchAppointments();
        handleCloseAssignDialog();
      }
    } catch (error) {
      console.error('Error assigning appointment:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تعيين الموعد للطبيب');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'قيد الانتظار',
      'confirmed': 'محجوز',
      'cancelled': 'ملغي',
      'completed': 'مكتمل'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'error',
      'completed': 'info'
    };
    return statusColors[status] || 'default';
  };

  const filteredAppointments = filterSpecialty === '' || filterSpecialty === 'الكل'
    ? appointments
    : appointments.filter(appointment => appointment.schedule.specialty === filterSpecialty);

  // Helper for checking if an appointment needs a doctor assignment
  const needsDoctorAssignment = (appointment) => {
    return appointment.status === 'pending' && 
           (!appointment.schedule.doctorName || appointment.schedule.doctorName === 'To be assigned');
  };

  return (
    <AdminLayout title="إدارة الحجوزات">
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
            الحجوزات
          </Typography>
          <TextField
            select
            label="تصفية حسب التخصص"
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          >
            {specialties.map((specialty) => (
              <MenuItem key={specialty} value={specialty}>
                {specialty}
              </MenuItem>
            ))}
          </TextField>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAppointments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد حجوزات
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم المريض</TableCell>
                  <TableCell>الهاتف</TableCell>
                  <TableCell>العمر</TableCell>
                  <TableCell>الطبيب</TableCell>
                  <TableCell>التخصص</TableCell>
                  <TableCell>تاريخ الموعد</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>{appointment.patient.phone}</TableCell>
                    <TableCell>{appointment.patient.age}</TableCell>
                    <TableCell>
                      {appointment.schedule.doctorName === 'To be assigned' 
                        ? <Typography color="error">غير محدد</Typography> 
                        : appointment.schedule.doctorName}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.schedule.specialty} 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(appointment.schedule.appointmentDate || appointment.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(appointment.status)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                        onClick={() => handleOpenStatusDialog(appointment)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenViewDialog(appointment)}>
                        <VisibilityIcon />
                      </IconButton>
                      
                      {/* Only show assign button for pending appointments that need doctor assignment */}
                      {needsDoctorAssignment(appointment) && (
                        <IconButton 
                          color="success" 
                          onClick={() => handleOpenAssignDialog(appointment)}
                          title="تعيين طبيب"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      )}
                      
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(appointment)}>
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

      {/* View Appointment Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
        <DialogTitle>تفاصيل الحجز</DialogTitle>
        <DialogContent>
          {currentAppointment && (
            <Box sx={{ mt: 2, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom color="primary">معلومات المريض</Typography>
              <Typography variant="subtitle1" gutterBottom>الاسم: {currentAppointment.patient.name}</Typography>
              <Typography variant="subtitle1" gutterBottom>العمر: {currentAppointment.patient.age} سنة</Typography>
              <Typography variant="subtitle1" gutterBottom>الهاتف: {currentAppointment.patient.phone}</Typography>
              
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>معلومات الموعد</Typography>
              <Typography variant="subtitle1" gutterBottom>
                الطبيب: {currentAppointment.schedule.doctorName === 'To be assigned' 
                  ? <span style={{ color: 'red' }}>غير محدد</span> 
                  : currentAppointment.schedule.doctorName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>التخصص: {currentAppointment.schedule.specialty}</Typography>
              <Typography variant="subtitle1" gutterBottom>تاريخ الموعد: {formatDate(currentAppointment.schedule.appointmentDate || currentAppointment.createdAt)}</Typography>
              <Typography variant="subtitle1" gutterBottom>الوقت: {currentAppointment.schedule.startTime} - {currentAppointment.schedule.endTime}</Typography>
              <Typography variant="subtitle1" gutterBottom>المكان: {currentAppointment.schedule.location}</Typography>
              <Typography variant="subtitle1" gutterBottom>الحالة: {getStatusLabel(currentAppointment.status)}</Typography>

              {currentAppointment.notes && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>الملاحظات</Typography>
                  <Paper variant="outlined" sx={{ p: 2, background: '#f9f9f9' }}>
                    <Typography variant="body2">{currentAppointment.notes}</Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>تغيير حالة الموعد</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Typography gutterBottom>
              موعد المريض: {currentAppointment?.patient?.name}
            </Typography>
            <Typography gutterBottom color="text.secondary">
              مع الدكتور: {currentAppointment?.schedule?.doctorName}
            </Typography>
            <Typography gutterBottom color="text.secondary" sx={{ mb: 2 }}>
              التاريخ: {currentAppointment?.schedule?.appointmentDate ? formatDate(currentAppointment.schedule.appointmentDate) : ''}
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="الحالة الجديدة"
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="inherit">إلغاء</Button>
          <Button onClick={handleUpdateStatus} color="primary" variant="contained">تحديث</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Doctor Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
        <DialogTitle>تعيين طبيب للموعد</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              المريض: {currentAppointment?.patient?.name}
            </Typography>
            <Typography gutterBottom>
              التخصص المطلوب: {currentAppointment?.schedule?.specialty}
            </Typography>
            
            {loadingSchedules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : availableDoctorSchedules.length > 0 ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>اختر الطبيب والموعد المناسب</InputLabel>
                <Select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  label="اختر الطبيب والموعد المناسب"
                >
                  {availableDoctorSchedules.map((schedule) => (
                    <MenuItem key={schedule._id} value={schedule._id}>
                      د. {schedule.doctorName} - {formatDate(schedule.appointmentDate)} - {schedule.startTime}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                لا توجد مواعيد متاحة لهذا التخصص. يرجى إضافة مواعيد جديدة أولاً.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} color="inherit">إلغاء</Button>
          <Button 
            onClick={handleAssignAppointment} 
            color="primary" 
            variant="contained"
            disabled={!selectedSchedule || loadingSchedules || availableDoctorSchedules.length === 0}
          >
            تعيين
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف موعد الحجز لـ {currentAppointment?.patient?.name}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">إلغاء</Button>
          <Button onClick={handleDeleteAppointment} color="error" variant="contained">حذف</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAppointments;
