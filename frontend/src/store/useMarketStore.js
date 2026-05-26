import { create } from 'zustand';
import axios from 'axios';
import io from 'socket.io-client';
import useAuthStore from './useAuthStore';

const useMarketStore = create((set, get) => ({
  stocks: [],
  watchlist: [],
  socket: null,
  isLoading: false,

  fetchWatchlist: async () => {
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/watchlist', config);
      set({ watchlist: response.data.symbols });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  },

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
      
      // 1. Persist to user's personal watchlist in DB
      await axios.post('/api/watchlist', { symbol }, config);
      
      // 2. Update local watchlist state
      const currentWatchlist = get().watchlist;
      if (!currentWatchlist.includes(symbol.toUpperCase())) {
        set({ watchlist: [...currentWatchlist, symbol.toUpperCase()] });
      }
      
      // 3. Ensure it's tracked on the server for socket updates and get initial quote
      const response = await axios.post('/api/market/track', { symbol }, config);
      const newStock = response.data;
      
      // 4. Update local stocks array so it appears in MarketWatch immediately
      const currentStocks = get().stocks;
      if (!currentStocks.find(s => s.symbol === newStock.symbol)) {
        set({ stocks: [...currentStocks, newStock] });
      }
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
    }
  },

  removeFromWatchlist: async (symbol) => {
    try {
      const token = useAuthStore.getState().user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/watchlist/${symbol}`, config);
      
      set({ watchlist: get().watchlist.filter(s => s !== symbol.toUpperCase()) });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
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

    const user = useAuthStore.getState().user;
    if (user && user._id) {
      socket.emit('join', user._id);
    }

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
