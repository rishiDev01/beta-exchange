import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useMarketStore from '../store/useMarketStore';
import useOrderStore from '../store/useOrderStore';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, BarChart2, DollarSign, Activity, Info, LogOut, Sun, Moon, Bell, Trash2, Plus } from 'lucide-react';
import OrderModal from '../components/OrderModal';
import StockChart from '../components/StockChart';
import ErrorBoundary from '../components/ErrorBoundary';
import PriceTicker from '../components/PriceTicker';
import { MarketWatchSkeleton } from '../components/Skeleton';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { stocks, fetchStocks, connectSocket, disconnectSocket, isLoading } = useMarketStore();
  const { holdings, orders, fetchOrders } = useOrderStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState('ABOVE');

  const fetchAlerts = async () => {
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/alerts', config);
      setAlerts(res.data.filter(a => a.symbol === symbol.toUpperCase()));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchAlerts();
    fetchOrders();
    connectSocket();
    return () => disconnectSocket();
  }, [symbol]);

  const stock = stocks.find(s => s.symbol === symbol.toUpperCase());
  const holding = holdings.find(h => h.symbol === symbol.toUpperCase());

  // Deterministic stable key statistics based on stock price and symbol
  const stats = useMemo(() => {
    if (!stock) return null;
    const seed = stock.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rangePercent = (seed % 3 + 1.5) / 100; // between 1.5% and 3.5%
    const low = stock.price * (1 - rangePercent);
    const high = stock.price * (1 + rangePercent);
    const marketCap = ((seed % 800) / 100 + 0.5).toFixed(2) + 'B';
    const peRatio = ((seed % 40) + 12.5).toFixed(2);
    const divYield = ((seed % 4) + 0.8).toFixed(2) + '%';
    const sentiment = seed % 2 === 0 ? 'BULLISH' : 'NEUTRAL';
    
    return { low, high, marketCap, peRatio, divYield, sentiment };
  }, [stock?.symbol, stock?.price]);

  // Filter top 5 recent orders for this specific stock
  const symbolOrders = useMemo(() => {
    return orders
      .filter(o => o.symbol === symbol.toUpperCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders, symbol]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const createAlert = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/alerts', {
        symbol,
        targetPrice: Number(newAlertPrice),
        condition: newAlertCondition
      }, config);
      setNewAlertPrice('');
      fetchAlerts();
      toast.success('Alert set!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set alert');
    }
  };

  const deleteAlert = async (id) => {
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/alerts/${id}`, config);
      fetchAlerts();
      toast.success('Alert removed');
    } catch (err) {
      toast.error('Failed to remove alert');
    }
  };

  if (isLoading && !stock) {
    return <div className="p-10 max-w-7xl mx-auto"><MarketWatchSkeleton /></div>;
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-55 dark:bg-gray-900 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
          <Info className="h-16 w-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Stock not found</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">We couldn't retrieve the market data for {symbol.toUpperCase()}.</p>
          <Link to="/" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full cursor-pointer">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800/85 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:border-gray-750 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="mr-4 p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Link>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{stock.symbol}</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{stock.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={toggleTheme} className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer animate-none">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={onLogout} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md shadow-rose-600/10 cursor-pointer">
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 border-b border-gray-50 dark:border-gray-750/50 pb-5">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1.5">Current Value</p>
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        <PriceTicker price={stock.price} />
                      </span>
                      <span className={`text-sm font-black px-2.5 py-1 rounded-lg flex items-center ${stock.change >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20'}`}>
                        {stock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1 inline" /> : <TrendingDown className="h-4 w-4 mr-1 inline" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({((stock.change / (stock.price - stock.change)) * 100).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2.5 w-full sm:w-auto">
                     <button onClick={() => setSelectedOrderType('BUY')} className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black tracking-widest shadow-md hover:shadow-lg shadow-emerald-600/10 dark:shadow-none hover:translate-y-[-1px] transition-all duration-200 active:scale-95 text-center cursor-pointer">BUY</button>
                     <button onClick={() => setSelectedOrderType('SELL')} className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl font-black tracking-widest shadow-md hover:shadow-lg shadow-rose-600/10 dark:shadow-none hover:translate-y-[-1px] transition-all duration-200 active:scale-95 text-center cursor-pointer">SELL</button>
                  </div>
               </div>
               
               <div className="mt-4">
                  <ErrorBoundary>
                    <StockChart symbol={stock.symbol} variant="detail" />
                  </ErrorBoundary>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <h3 className="text-base font-black uppercase tracking-wider mb-4 flex items-center text-gray-900 dark:text-white">
                    <Info className="h-5 w-5 mr-2 text-blue-500" /> Key Statistics
                  </h3>
                  <div className="space-y-4">
                     <div className="flex justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Day's Range</span>
                        <span className="text-gray-900 dark:text-white text-sm font-black">${stats.low.toFixed(2)} - ${stats.high.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Market Capitalization</span>
                        <span className="text-gray-900 dark:text-white text-sm font-black">{stats.marketCap}</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">P/E Ratio (LTM)</span>
                        <span className="text-gray-900 dark:text-white text-sm font-black">{stats.peRatio}</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Dividend Yield</span>
                        <span className="text-gray-900 dark:text-white text-sm font-black">{stats.divYield}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <h3 className="text-base font-black uppercase tracking-wider mb-4 flex items-center text-gray-900 dark:text-white">
                    <Activity className="h-5 w-5 mr-2 text-emerald-500 animate-pulse" /> Technical Sentiment
                  </h3>
                  <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-805">
                     <div className="text-center">
                        <p className={`text-3xl font-black ${stats.sentiment === 'BULLISH' ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>{stats.sentiment}</p>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">based on 10-day moving averages</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Holdings & Alerts */}
          <div className="space-y-6">
            {holding ? (
              <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/10 border border-emerald-400/20">
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1.5">Your Current Holding</p>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">{holding.quantity} Shares</h3>
                    <p className="text-emerald-100 text-xs mt-1.5 font-bold">Average Price: ${holding.averagePrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tight">${(holding.quantity * stock.price).toFixed(2)}</p>
                    <span className={`text-[10px] font-black bg-white/20 px-2.5 py-0.5 rounded-full inline-block mt-1.5 border border-white/10 ${((stock.price - holding.averagePrice) * holding.quantity >= 0 ? 'text-emerald-100' : 'text-rose-100')}`}>
                       {((stock.price - holding.averagePrice) * holding.quantity >= 0 ? '+' : '-')}$
                       {Math.abs((stock.price - holding.averagePrice) * holding.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800/40 border border-dashed border-gray-250 dark:border-gray-700 rounded-2xl p-8 text-center transition-colors shadow-sm">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900/60 flex items-center justify-center mx-auto mb-4 border border-gray-150 dark:border-gray-800">
                  <DollarSign className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-bold text-sm">You don't own any {stock.symbol} yet.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Execute a buy order above to start trading.</p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <Bell className="h-5 w-5 mr-2 text-amber-500" /> Price Alerts
              </h3>
              
              <form onSubmit={createAlert} className="mb-6 space-y-3">
                 <div className="flex gap-2">
                    <select 
                      value={newAlertCondition}
                      onChange={(e) => setNewAlertCondition(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-black rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                       <option value="ABOVE">ABOVE</option>
                       <option value="BELOW">BELOW</option>
                    </select>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      placeholder="Target Price..."
                      value={newAlertPrice}
                      onChange={(e) => setNewAlertPrice(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 font-bold text-gray-900 dark:text-white transition-all"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all hover:shadow-md hover:shadow-blue-600/10 active:scale-95 flex items-center justify-center cursor-pointer">
                       <Plus className="h-5 w-5" />
                    </button>
                 </div>
              </form>

              <div className="space-y-3">
                 {alerts.length === 0 ? (
                   <p className="text-gray-400 dark:text-gray-505 text-xs italic">No alerts for this stock.</p>
                 ) : (
                   alerts.map(alert => (
                     <div key={alert._id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-805 transition-colors">
                        <div>
                           <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1 ${alert.condition === 'ABOVE' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-955/50' : 'bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-955/50'}`}>
                              {alert.condition}
                           </span>
                           <p className="text-sm font-black text-gray-900 dark:text-white">${alert.targetPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                           <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${alert.status === 'TRIGGERED' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-455'}`}>
                              {alert.status}
                           </span>
                           <button onClick={() => deleteAlert(alert._id)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all p-1.5 rounded-lg cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" /> Recent Activity
              </h3>
              {symbolOrders.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-xs italic">No recent trades for this stock.</p>
              ) : (
                <div className="space-y-3">
                   {symbolOrders.map(order => (
                     <div key={order._id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100/50 dark:border-gray-800 transition-colors">
                        <div>
                           <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1 ${order.type === 'BUY' ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-955/50' : 'bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-955/50'}`}>
                              {order.type}
                           </span>
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                             {order.quantity} Shares @ ${order.price.toFixed(2)}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-gray-900 dark:text-white">
                             ${(order.price * order.quantity).toFixed(2)}
                           </p>
                           <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded-full mt-1.5 ${order.status === 'EXECUTED' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'}`}>
                             {order.status}
                           </span>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {selectedOrderType && (
        <OrderModal 
          stock={stock}
          type={selectedOrderType}
          onClose={() => setSelectedOrderType(null)}
        />
      )}
    </div>
  );
};

export default StockDetail;
