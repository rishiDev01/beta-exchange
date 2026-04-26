import { create } from 'zustand';
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from './useAuthStore';

const useMarketStore = create((set) => ({
  stocks: [],
  socket: null,
  isLoading: false,

  fetchStocks: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/market/stocks', config);
      set({ stocks: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching stocks:', error);
    }
  },

  connectSocket: () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const socket = io(backendUrl); 

    socket.on('marketData', (updatedStocks) => {
      set({ stocks: updatedStocks });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    set((state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      return { socket: null };
    });
  },
}));

export default useMarketStore;
