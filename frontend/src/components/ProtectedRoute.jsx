import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      try {
        // Check if token exists
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Validate token by making a request
        await authService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth validation failed:', error);
        // Handle token invalidation
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
