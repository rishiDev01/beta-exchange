import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
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

  // Initialize Chart (v5 syntax)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#333',
      },
      width: container.clientWidth || 600,
      height: 400,
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
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
  }, []);

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
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 overflow-hidden min-h-[550px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center">
            {symbol} <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded uppercase tracking-widest">Live Chart</span>
          </h2>
          <p className="text-gray-500 text-sm">Professional Trading Terminal</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Symbol (e.g. MSFT)"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>
      </div>

      <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-xs font-bold text-blue-600">SYNCING...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
            <div className="text-center p-4">
                <p className="text-red-500 font-bold mb-1">DATA ERROR</p>
                <p className="text-gray-500 text-xs">{error}</p>
                <button 
                    onClick={() => fetchHistory(symbol)}
                    className="mt-3 px-4 py-1 bg-gray-900 text-white text-xs rounded-full"
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

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
          <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</div>
              <div className="text-sm font-bold text-green-600 flex items-center justify-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> LIVE
              </div>
          </div>
          <div className="text-center border-x border-gray-100 px-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Source</div>
              <div className="text-sm font-bold text-gray-700">FINNHUB</div>
          </div>
          <div className="text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Timezone</div>
              <div className="text-sm font-bold text-blue-600 tracking-tight">UTC</div>
          </div>
      </div>
    </div>
  );
};

export default StockChart;
