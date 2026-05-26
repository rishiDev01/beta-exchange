import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { ArrowLeft, Trophy, Medal, LogOut, Sun, Moon, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import ErrorBoundary from '../components/ErrorBoundary';
import { TableSkeleton } from '../components/Skeleton';

const Leaderboard = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = user?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/users/leaderboard', config);
        setLeaderboard(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [user]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Link>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Leaderboard</span>
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

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-4">
              <Trophy className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
           </div>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Top Traders</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">Ranked by total portfolio value (Cash + Holdings)</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
           {isLoading ? (
             <div className="p-10"><TableSkeleton /></div>
           ) : (
             <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Trader</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Net Worth</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {leaderboard.map((item, i) => (
                     <tr key={item._id} className={`${item._id === user?._id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex items-center">
                              {i === 0 ? <Medal className="h-5 w-5 text-yellow-500 mr-1" /> : 
                               i === 1 ? <Medal className="h-5 w-5 text-gray-400 mr-1" /> :
                               i === 2 ? <Medal className="h-5 w-5 text-amber-600 mr-1" /> : null}
                              <span className={`text-sm font-black ${i < 3 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{i + 1}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                                 <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                                 {item._id === user?._id && <span className="text-[10px] font-black text-blue-600 uppercase">You</span>}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right">
                           <p className="text-base font-black text-gray-900 dark:text-white">${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Cash: ${item.cash.toLocaleString()}</p>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
