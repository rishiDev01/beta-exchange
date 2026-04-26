import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut } from 'lucide-react';
import Wallet from '../components/Wallet';
import MarketWatch from '../components/MarketWatch';
import Holdings from '../components/Holdings';
import StockChart from '../components/StockChart';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Beta Exchange</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-2 sm:mr-4 text-sm sm:text-base hidden xs:inline">
                Welcome, <span className="font-semibold hidden sm:inline">{user && user.name}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
             <MarketWatch />
          </div>
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-1 lg:order-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Wallet />
                <Holdings />
             </div>
             <StockChart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
