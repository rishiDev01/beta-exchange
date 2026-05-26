import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useOrderStore from '../store/useOrderStore';
import { ArrowLeft, User as UserIcon, Mail, Calendar, Shield, LogOut, Sun, Moon, Award, Target, Zap } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { orders, fetchOrders } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    totalTrades: orders.length,
    executedTrades: orders.filter(o => o.status === 'EXECUTED').length,
    pendingTrades: orders.filter(o => o.status === 'PENDING').length,
    cancelledTrades: orders.filter(o => o.status === 'CANCELLED').length,
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
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">User Profile</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div className="px-8 pb-8">
              <div className="relative flex justify-center sm:justify-start">
                <div className="-mt-16 p-2 bg-white dark:bg-gray-800 rounded-full transition-colors flex items-center justify-center">
                   <div className="bg-blue-100 dark:bg-blue-900/50 p-6 rounded-full flex items-center justify-center">
                      <UserIcon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                   </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{user && user.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center sm:justify-start mt-1">
                    <Mail className="h-4 w-4 mr-2" /> {user && user.email}
                  </p>
                </div>
                <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                   <Shield className="h-4 w-4 mr-2" /> Verified Account
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Trades', value: stats.totalTrades, icon: Target, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
              { label: 'Executed', value: stats.executedTrades, icon: Zap, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
              { label: 'Pending', value: stats.pendingTrades, icon: Award, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
              { label: 'Cancelled', value: stats.cancelledTrades, icon: LogOut, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
                <div className={`${stat.bg} p-2 rounded-lg w-fit mb-4`}>
                   <stat.icon className={`h-6 w-6 ${stat.text}`} />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Information</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member Since</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {user && new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Status</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">Active</span>
              </div>
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trading Limit</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
