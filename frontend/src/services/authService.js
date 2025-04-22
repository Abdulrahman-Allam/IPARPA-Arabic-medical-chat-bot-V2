import api from './api';

// Store token in localStorage
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Set authorization header for API calls
export const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Check if token is expired (without using jwt-decode)
const isTokenExpired = () => {
  try {
    // We'll do a simple check with the API
    return false; // Initially assume not expired
  } catch (error) {
    // If there's an error parsing the token, treat it as expired
    return true;
  }
};

// Add valid token check function 
const validateTokenOnLoad = async () => {
  // Only proceed if there's a token stored
  const token = getToken();
  if (!token) return;

  try {
    // Make a request to the current user endpoint to validate token
    await api.get('/auth/me');
    // If successful, token is valid, nothing to do
  } catch (error) {
    // If 401 error, token is expired/invalid - logout
    if (error.response && error.response.status === 401) {
      console.log('Token validation failed on app load');
      removeToken();
      setAuthHeader();
      // Redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
};

// Authentication service
export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setAuthHeader();
      }
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setAuthHeader();
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    removeToken();
    setAuthHeader();
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Add token renewal method
  renewToken: async () => {
    try {
      // We could implement a token refresh endpoint
      // For now, we'll just redirect to login if token is invalid
      return false;
    } catch (error) {
      console.error('Token renewal error:', error);
      return false;
    }
  },

  isAuthenticated: () => {
    const token = getToken();
    return !!token;
  },

  // Initialize method to run on app startup
  initialize: async () => {
    setAuthHeader();
    await validateTokenOnLoad();
  }
};

// On import, instead of just setting the header, run the initialize function
authService.initialize();

export default authService;
