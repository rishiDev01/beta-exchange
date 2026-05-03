import { create } from 'zustand';
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from './useAuthStore';

const useMarketStore = create((set, get) => ({
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

  searchStocks: async (query) => {
    if (!query) return [];
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/market/search?q=${query}`, config);
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  },

  addStockToWatchlist: async (symbol) => {
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post('/api/market/track', { symbol }, config);
      const newStock = response.data;
      
      const currentStocks = get().stocks;
      if (!currentStocks.find(s => s.symbol === newStock.symbol)) {
        set({ stocks: [...currentStocks, newStock] });
      }
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
    }
  },

  connectSocket: () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const socket = io(backendUrl, {
      transports: ['websocket']
    }); 

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
