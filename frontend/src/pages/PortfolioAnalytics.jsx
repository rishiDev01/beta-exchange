import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useOrderStore from '../store/useOrderStore';
import useMarketStore from '../store/useMarketStore';
import useWalletStore from '../store/useWalletStore';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { ArrowLeft, PieChart, TrendingUp, BarChart3, Wallet, LogOut, Sun, Moon, Info } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import ErrorBoundary from '../components/ErrorBoundary';

const PortfolioAnalytics = () => {
  const { holdings } = useOrderStore();
  const { stocks } = useMarketStore();
  const { balance } = useWalletStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const allocationData = useMemo(() => {
    const data = holdings.map(h => {
      const currentPrice = stocks.find(s => s.symbol === h.symbol)?.price || h.averagePrice;
      return {
        name: h.symbol,
        value: currentPrice * h.quantity
      };
    });

    if (balance > 0) {
      data.push({ name: 'Cash', value: balance });
    }

    return data.sort((a, b) => b.value - a.value);
  }, [holdings, stocks, balance]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  // Simulated performance data
  const performanceData = [
    { date: 'Mon', value: 10000 },
    { date: 'Tue', value: 10200 },
    { date: 'Wed', value: 10100 },
    { date: 'Thu', value: 10400 },
    { date: 'Fri', value: 10800 },
    { date: 'Sat', value: 10700 },
    { date: 'Sun', value: 11000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Link>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Portfolio Analytics</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={onLogout} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Asset Allocation */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                 <PieChart className="h-5 w-5 mr-2 text-blue-500" /> Asset Allocation
               </h3>
               <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RePieChart>
                     <Pie
                       data={allocationData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {allocationData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: '#3B82F6', borderRadius: '8px' }}
                        itemStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                     />
                     <Legend verticalAlign="bottom" height={36}/>
                   </RePieChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Performance Over Time */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                 <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> Performance (7D)
               </h3>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: '#3B82F6', borderRadius: '8px' }}
                        itemStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                 <BarChart3 className="h-5 w-5 mr-2 text-purple-500" /> Portfolio Breakdown
               </h3>
               <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                        <th className="pb-4">Asset</th>
                        <th className="pb-4">Category</th>
                        <th className="pb-4">Weight</th>
                        <th className="pb-4 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {allocationData.map((item, i) => (
                        <tr key={i}>
                          <td className="py-4 text-sm font-bold text-gray-900 dark:text-white">{item.name}</td>
                          <td className="py-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                             {item.name === 'Cash' ? 'Liquidity' : 'Equity'}
                          </td>
                          <td className="py-4">
                             <div className="flex items-center space-x-2">
                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.value / allocationData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                   {((item.value / allocationData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
                                </span>
                             </div>
                          </td>
                          <td className="py-4 text-sm font-black text-right text-gray-900 dark:text-white">${item.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
};

export default PortfolioAnalytics;
