import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api/users/';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',

  reset: () => set({ isLoading: false, isError: false, isSuccess: false, message: '' }),

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL, userData);
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      set({ user: response.data, isLoading: false, isSuccess: true });
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      set({ isLoading: false, isError: true, message, user: null });
    }
  },

  login: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL + 'login', userData);
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      set({ user: response.data, isLoading: false, isSuccess: true });
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      set({ isLoading: false, isError: true, message, user: null });
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null });
  },
}));

export default useAuthStore;
