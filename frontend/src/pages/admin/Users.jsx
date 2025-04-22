import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdminLayout } from '../../components/admin';
import { adminService } from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('حدث خطأ أثناء جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (user) => {
    setCurrentUser(user);
    setSelectedRole(user.role);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentUser(null);
    setSelectedRole('');
    setError('');
  };

  const handleOpenDeleteDialog = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentUser(null);
  };

  const handleUpdateRole = async () => {
    if (!currentUser || !selectedRole) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await adminService.updateUserRole(currentUser._id, { role: selectedRole });
      if (response.success) {
        setSuccess('تم تحديث دور المستخدم بنجاح');
        fetchUsers();
        handleCloseEditDialog();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تحديث دور المستخدم');
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await adminService.deleteUser(currentUser._id);
      if (response.success) {
        setSuccess('تم حذف المستخدم بنجاح');
        fetchUsers();
        handleCloseDeleteDialog();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم');
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
    <AdminLayout title="إدارة المستخدمين">
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

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h5" color="primary">
            إدارة المستخدمين
          </Typography>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              لا يوجد مستخدمين
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>البريد الإلكتروني</TableCell>
                  <TableCell>رقم الهاتف</TableCell>
                  <TableCell>العمر</TableCell>
                  <TableCell>الدور</TableCell>
                  <TableCell>تاريخ التسجيل</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.age}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'مدير' : 'مستخدم'} 
                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenEditDialog(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
                        disabled={user.email === 'admin@gmail.com'} // Prevent deleting main admin
                      >
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

      {/* Edit Role Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>تغيير دور المستخدم</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Typography gutterBottom>
              {currentUser?.name} - {currentUser?.email}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>الدور</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="الدور"
              >
                <MenuItem value="user">مستخدم</MenuItem>
                <MenuItem value="admin">مدير</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="inherit">إلغاء</Button>
          <Button onClick={handleUpdateRole} color="primary" variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف المستخدم {currentUser?.name}؟
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">إلغاء</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">حذف</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
