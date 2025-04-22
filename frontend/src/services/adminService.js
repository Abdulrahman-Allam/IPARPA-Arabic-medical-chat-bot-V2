import api from './api';

export const adminService = {
  // Schedule Management
  getSchedules: async () => {
    try {
      const response = await api.get('/schedules');
      return response.data;
    } catch (error) {
      console.error('Failed to get schedules:', error);
      throw error;
    }
  },
  
  getScheduleById: async (id) => {
    try {
      const response = await api.get(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get schedule:', error);
      throw error;
    }
  },
  
  createSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  },
  
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error;
    }
  },
  
  deleteSchedule: async (id) => {
    try {
      const response = await api.delete(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw error;
    }
  },
  
  // User Management
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },
  
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  },
  
  updateUserRole: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}/role`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
  
  // Appointment Management
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Failed to get appointments:', error);
      throw error;
    }
  },
  
  updateAppointmentStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/appointments/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      throw error;
    }
  },
  
  deleteAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      throw error;
    }
  },

  getAvailableSchedulesForAssignment: async (specialty) => {
    try {
      const response = await api.get(`/appointments/available-schedules/${specialty}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get available schedules for assignment:', error);
      throw error;
    }
  },

  assignAppointmentToDoctor: async (appointmentId, scheduleId) => {
    try {
      const response = await api.post('/appointments/assign', { appointmentId, scheduleId });
      return response.data;
    } catch (error) {
      console.error('Failed to assign appointment to doctor:', error);
      throw error;
    }
  }
};

export default adminService;
