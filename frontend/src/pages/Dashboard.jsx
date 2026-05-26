import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { LogOut, Sun, Moon, History, User, BarChart3, Trophy } from 'lucide-react';
import Wallet from '../components/Wallet';
import MarketWatch from '../components/MarketWatch';
import Holdings from '../components/Holdings';
import StockChart from '../components/StockChart';
import MarketNews from '../components/MarketNews';
import TradeFeed from '../components/TradeFeed';
import ErrorBoundary from '../components/ErrorBoundary';
import PortfolioSummary from '../components/PortfolioSummary';

import { toast } from 'react-hot-toast';
import useMarketStore from '../store/useMarketStore';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { socket } = useMarketStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      socket.on('alertTriggered', (data) => {
        toast(`🔔 ALERT: ${data.symbol} hit $${data.price} (Target: $${data.targetPrice})`, {
          duration: 6000,
          icon: '🚀',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      });
    }
    return () => {
      if (socket) socket.off('alertTriggered');
    };
  }, [socket]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Beta Exchange</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden lg:flex items-center space-x-2 lg:space-x-4">
                <Link
                  to="/leaderboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Trophy className="h-4 w-4 mr-1.5" />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <History className="h-4 w-4 mr-1.5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  <span>Profile</span>
                </Link>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className="text-gray-700 dark:text-gray-300 mr-2 sm:mr-4 text-sm sm:text-base hidden sm:inline">
                Welcome, <span className="font-semibold">{user && user.name}</span>
              </span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <PortfolioSummary />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1 lg:sticky lg:top-20 lg:h-[calc(100vh-100px)] lg:flex lg:flex-col space-y-4 sm:space-y-6 lg:space-y-0 lg:gap-4">
            <ErrorBoundary>
              <MarketWatch />
            </ErrorBoundary>
            <ErrorBoundary>
              <TradeFeed />
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-1 lg:order-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ErrorBoundary>
                  <Wallet />
                </ErrorBoundary>
                <ErrorBoundary>
                  <Holdings />
                </ErrorBoundary>
             </div>
             <ErrorBoundary>
                <StockChart />
             </ErrorBoundary>
             <ErrorBoundary>
                <MarketNews />
             </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
