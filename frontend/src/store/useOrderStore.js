import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';
import useWalletStore from './useWalletStore';

const API_URL = '/api/orders/';

const useOrderStore = create((set, get) => ({
  orders: [],
  holdings: [],
  isLoading: false,
  isError: false,
  message: '',

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, isError: true, message: error.response?.data?.message || error.message });
    }
  },

  fetchHoldings: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL + 'holdings', config);
      set({ holdings: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, isError: true, message: error.response?.data?.message || error.message });
    }
  },

  placeOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, orderData, config);
      
      // Refresh holdings and wallet balance after successful order
      get().fetchHoldings();
      get().fetchOrders();
      useWalletStore.getState().fetchWallet();
      
      set({ isLoading: false, isError: false });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message: msg });
      throw new Error(msg);
    }
  },
}));

export default useOrderStore;
