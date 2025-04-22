import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { authService } from '../services/authService';

const AdminRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);
      try {
        // Check if token exists
        if (!authService.isAuthenticated()) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }

        // Validate token and check if user is admin
        const response = await authService.getCurrentUser();
        if (response.success && response.user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin validation failed:', error);
        authService.logout();
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();
  }, []);

  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;
