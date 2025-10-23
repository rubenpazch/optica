import axios from 'axios';
import { User, Patient, PatientsResponse, DashboardStats } from '../types';

// Create axios instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token from login response
api.interceptors.response.use(
  (response) => {
    // Store token from login response
    if (response.data.data?.token) {
      setToken(response.data.data.token);
    }
    return response;
  },
  (error) => {
    // Handle 401 errors by removing invalid token
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post('/users/sign_in', {
      user: { email, password }
    });
    return response.data.data.user;
  },

  register: async (email: string, password: string): Promise<User> => {
    const response = await api.post('/users', {
      user: { email, password, password_confirmation: password }
    });
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await api.delete('/users/sign_out');
    } finally {
      removeToken();
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/current_user');
    return response.data.user;
  },
};

// Patients API
export const patientsAPI = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    city?: string;
    state?: string;
    status?: string;
    sort?: string;
  }): Promise<PatientsResponse> => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  getOne: async (id: number): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.post('/patients', { patient });
    return response.data;
  },

  update: async (id: number, patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, { patient });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  toggleStatus: async (id: number): Promise<Patient> => {
    const response = await api.post(`/patients/${id}/toggle_status`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard');
    return response.data.dashboard;
  },
};

export default api;