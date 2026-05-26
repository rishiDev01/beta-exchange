import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import StockDetail from './pages/StockDetail';
import PortfolioAnalytics from './pages/PortfolioAnalytics';
import Leaderboard from './pages/Leaderboard';
import PrivateRoute from './components/PrivateRoute';
import MobileNav from './components/MobileNav';
import useThemeStore from './store/useThemeStore';
import useAuthStore from './store/useAuthStore';

function App() {
  const { initTheme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <div className="App font-sans antialiased text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen w-full transition-colors duration-200 pb-16 lg:pb-0">
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <PortfolioAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/stock/:symbol"
            element={
              <PrivateRoute>
                <StockDetail />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        {user && <MobileNav />}
      </div>
    </Router>
  );
}

export default App;
