import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { Search } from 'lucide-react';

const StockChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  
  const [symbol, setSymbol] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // Initialize Chart (v5 syntax)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    
    const isDark = theme === 'dark';
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1f2937' : 'white' }, // gray-800 or white
        textColor: isDark ? '#d1d5db' : '#333', // gray-300 or #333
      },
      width: container.clientWidth || 600,
      height: 400,
      grid: {
        vertLines: { color: isDark ? '#374151' : '#f0f0f0' }, // gray-700
        horzLines: { color: isDark ? '#374151' : '#f0f0f0' }, // gray-700
      },
    });

    // NEW v5 API: Use addSeries with the CandlestickSeries constant
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial load
    fetchHistory(symbol);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []); // recreate chart on mount

  // Watch for theme changes to update chart styling
  useEffect(() => {
    if (chartRef.current) {
      const isDark = theme === 'dark';
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: isDark ? '#1f2937' : 'white' },
          textColor: isDark ? '#d1d5db' : '#333',
        },
        grid: {
          vertLines: { color: isDark ? '#374151' : '#f0f0f0' },
          horzLines: { color: isDark ? '#374151' : '#f0f0f0' },
        },
      });
    }
  }, [theme]);

  // Watch for symbol changes
  useEffect(() => {
    if (chartRef.current && seriesRef.current) {
       fetchHistory(symbol);
    }
  }, [symbol]);

  const fetchHistory = async (targetSymbol) => {
    if (!seriesRef.current || !chartRef.current) return;

    setLoading(true);
    setError(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(`/api/market/history/${targetSymbol}`, config);
      const data = response.data;

      if (data && Array.isArray(data) && data.length > 0) {
        const formattedData = data
          .map(item => ({
            time: Number(item.time), 
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
          }))
          .sort((a, b) => a.time - b.time);

        if (seriesRef.current) {
          seriesRef.current.setData(formattedData);
          chartRef.current.timeScale().fitContent();
        }
      } else {
        setError(`No historical data found for ${targetSymbol}`);
      }
    } catch (err) {
      setError('Market data currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 overflow-hidden min-h-[550px] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            {symbol} <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded uppercase tracking-widest">Live Chart</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Professional Trading Terminal</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Symbol (e.g. MSFT)"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </form>
      </div>

      <div className="relative border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mb-2"></div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">SYNCING...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80">
            <div className="text-center p-4">
                <p className="text-red-500 font-bold mb-1">DATA ERROR</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{error}</p>
                <button 
                    onClick={() => fetchHistory(symbol)}
                    className="mt-3 px-4 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-full"
                >
                    Retry
                </button>
            </div>
          </div>
        )}
        
        <div 
          ref={chartContainerRef} 
          className="w-full" 
          style={{ height: '400px' }} 
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-700">
          <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Status</div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                  <span className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full mr-2 animate-pulse"></span> LIVE
              </div>
          </div>
          <div className="text-center border-x border-gray-100 dark:border-gray-700 px-2">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Source</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">FINNHUB</div>
          </div>
          <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Timezone</div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-tight">UTC</div>
          </div>
      </div>
    </div>
  );
};

export default StockChart;
