import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { Search, Activity, BarChart2, TrendingUp } from 'lucide-react';

const StockChart = ({ symbol: initialSymbol = 'AAPL', variant = 'default' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // Sync with prop symbol if it changes from outside
  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const isDark = theme === 'dark';
    
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#111827' : 'white' },
        textColor: isDark ? '#9CA3AF' : '#333',
      },
      width: container.clientWidth || 600,
      height: 400,
      grid: {
        vertLines: { color: isDark ? '#1F2937' : '#f0f0f0' },
        horzLines: { color: isDark ? '#1F2937' : '#f0f0f0' },
      },
      timeScale: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#F59E0B',
      lineWidth: 2,
      visible: showSMA,
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    smaSeriesRef.current = smaSeries;

    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    fetchHistory(symbol);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // Update options when theme, showSMA or showVolume changes
  useEffect(() => {
    if (chartRef.current) {
      const isDark = theme === 'dark';
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: isDark ? '#111827' : 'white' },
          textColor: isDark ? '#9CA3AF' : '#333',
        },
        grid: {
          vertLines: { color: isDark ? '#1F2937' : '#f0f0f0' },
          horzLines: { color: isDark ? '#1F2937' : '#f0f0f0' },
        },
      });
    }
    if (smaSeriesRef.current) {
      smaSeriesRef.current.applyOptions({ visible: showSMA });
    }
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: showVolume });
    }
  }, [theme, showSMA, showVolume]);

  // Handle symbol change
  useEffect(() => {
    if (chartRef.current) {
      fetchHistory(symbol);
    }
  }, [symbol]);

  const calculateSMA = (data, period = 10) => {
    const smaData = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period) continue;
      const sum = data.slice(i - period, i).reduce((acc, curr) => acc + curr.close, 0);
      smaData.push({ time: data[i].time, value: sum / period });
    }
    return smaData;
  };

  const fetchHistory = async (targetSymbol) => {
    if (!chartRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/market/history/${targetSymbol}`, config);
      const data = response.data;

      if (data && Array.isArray(data) && data.length > 0) {
        const sortedData = data
          .map(item => ({
            time: Number(item.time),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
            volume: Number(item.volume || 0),
          }))
          .sort((a, b) => a.time - b.time);

        candlestickSeriesRef.current.setData(sortedData);
        
        const volumeData = sortedData.map(item => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));
        volumeSeriesRef.current.setData(volumeData);

        const smaData = calculateSMA(sortedData, 10);
        smaSeriesRef.current.setData(smaData);

        chartRef.current.timeScale().fitContent();
      } else {
        setError(`No data for ${targetSymbol}`);
      }
    } catch (err) {
      setError('Connection failed');
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
    <div className={variant === 'detail' ? "w-full overflow-hidden transition-colors duration-200" : "bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-4 sm:p-6 overflow-hidden transition-colors duration-200 border border-gray-100 dark:border-gray-700"}>
      {variant === 'detail' ? (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              onClick={() => setShowSMA(!showSMA)}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${showSMA ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-700'}`}
            >
              SMA
            </button>
            <button 
              type="button"
              onClick={() => setShowVolume(!showVolume)}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${showVolume ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-700'}`}
            >
              VOL
            </button>
          </div>
          <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/30 flex items-center">
            <Activity className="h-3 w-3 mr-1 text-green-500 animate-pulse" /> Live Terminal
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3">
               <h2 className="text-3xl font-black text-gray-900 dark:text-white">{symbol}</h2>
               <div className="flex space-x-1">
                  <button 
                    onClick={() => setShowSMA(!showSMA)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${showSMA ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
                  >
                    SMA
                  </button>
                  <button 
                    onClick={() => setShowVolume(!showVolume)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${showVolume ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
                  >
                    VOL
                  </button>
               </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center">
              <Activity className="h-3 w-3 mr-1 text-green-500" /> Real-time Execution Terminal
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search symbol..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </form>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 h-[400px] transition-colors">
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
      
      <div className="flex justify-between items-center mt-4">
         <div className="flex space-x-4">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div> Bullish
            </div>
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div> Bearish
            </div>
         </div>
         <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
            Interactive Chart v5.0
         </div>
      </div>
    </div>
  );
};

export default StockChart;
