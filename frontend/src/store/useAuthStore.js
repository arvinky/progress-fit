import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  client: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null, client: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user, client } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({
        token,
        user,
        client,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true, role: user.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login gagal. Hubungi PT Anda.';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user, client } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        token,
        user,
        client,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true, role: user.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registrasi gagal.';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null, client: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const { token } = get();
    if (!token) return;

    set({ loading: true });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      const { user, client } = response.data;
      set({ user, client, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error('Fetch me error:', error);
      // If token expired
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null, client: null, isAuthenticated: false, loading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileData);
      set({ user: response.data.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Gagal memperbarui profil' };
    }
  }
}));

// Set token initially if exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
