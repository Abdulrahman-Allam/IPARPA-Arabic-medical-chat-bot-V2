import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 seconds timeout
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Check if error is due to unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      console.log('Authentication error:', error.response.data?.message || 'Unauthorized');
      
      // Clear token and force logout
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
      
      // Show alert message about session expiration
      if (error.response.data?.expired) {
        alert('انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.');
      }
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login due to authentication error');
        window.location.href = '/login';
      }
    }
    
    console.error('API Error:', error.response?.data || error.message || error);
    return Promise.reject(error);
  }
);

// Chat API services
export const chatService = {
  initChat: async () => {
    try {
      const response = await api.post('/chat/init');
      return response.data;
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      throw error;
    }
  },
  
  sendMessage: async (sessionId, content) => {
    try {
      console.log(`Sending message to session ${sessionId}:`, content);
      const response = await api.post('/chat/send', { sessionId, content });
      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
  
  getChatHistory: async (sessionId) => {
    try {
      console.log(`Getting chat history for session ${sessionId}`);
      const response = await api.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  },
  
  getMedicalHistory: async () => {
    try {
      const response = await api.get('/chat/medical-history');
      return response.data;
    } catch (error) {
      console.error('Failed to get medical history:', error);
      throw error;
    }
  },
  
  getUserSessions: async () => {
    try {
      const response = await api.get('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to get user chat sessions:', error);
      throw error;
    }
  },
  
  sendBookingSMS: async (bookingData) => {
    try {
      const response = await api.post('/chat/booking-sms', bookingData);
      return response.data;
    } catch (error) {
      console.error('Failed to send booking SMS:', error);
      throw error;
    }
  }
};

// Location API services
export const locationService = {
  getHospitals: async (query) => {
    try {
      const response = await api.get('/locations/hospitals', { params: { query } });
      return response.data;
    } catch (error) {
      console.error('Failed to get hospitals:', error);
      throw error;
    }
  },
  
  getPharmacies: async (query) => {
    try {
      const response = await api.get('/locations/pharmacies', { params: { query } });
      return response.data;
    } catch (error) {
      console.error('Failed to get pharmacies:', error);
      throw error;
    }
  }
};

// Appointment API services
export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    try {
      console.log("Booking appointment with data:", appointmentData); // Debug
      const response = await api.post('/appointments', appointmentData);
      console.log("Booking response:", response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  },
  
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Failed to get appointments:', error);
      throw error;
    }
  },
  
  getAvailableSchedulesBySpecialty: async (specialty) => {
    try {
      // Properly encode the Arabic specialty name for the URL
      const encodedSpecialty = encodeURIComponent(specialty);
      console.log(`Fetching available schedules for specialty: ${specialty} (encoded: ${encodedSpecialty})`);
      
      const response = await api.get(`/schedules/available/${encodedSpecialty}`);
      console.log('Available schedules response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to get available schedules for ${specialty}:`, error);
      throw error;
    }
  },

  // Add a method to get user's appointments
  getUserAppointments: async () => {
    try {
      console.log("Fetching user appointments..."); // Debug
      const response = await api.get('/appointments/my-appointments');
      console.log("Retrieved appointments:", response.data); // Debug the response
      return response.data;
    } catch (error) {
      console.error('Failed to get user appointments:', error);
      throw error;
    }
  },
  
  // Add a method to cancel an appointment
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    }
  }
};

export default api;
