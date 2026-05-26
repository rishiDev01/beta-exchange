import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const API_URL = '/api/wallet/';

const useWalletStore = create((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  isError: false,
  message: '',

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(API_URL, config);
      set({ balance: response.data.balance, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  deposit: async (amount) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(API_URL + 'deposit', { amount }, config);
      set((state) => ({ 
        balance: response.data.wallet.balance, 
        transactions: [response.data.transaction, ...state.transactions],
        isLoading: false, 
        isError: false 
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
      throw new Error(message);
    }
  },

  withdraw: async (amount) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(API_URL + 'withdraw', { amount }, config);
      set((state) => ({ 
        balance: response.data.wallet.balance, 
        transactions: [response.data.transaction, ...state.transactions],
        isLoading: false, 
        isError: false 
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
      throw new Error(message);
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(API_URL + 'transactions', config);
      set({ transactions: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  }
}));

export default useWalletStore;
