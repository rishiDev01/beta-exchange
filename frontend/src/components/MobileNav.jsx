import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, Trophy, User } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: History, label: 'Orders', path: '/orders' },
    { icon: Trophy, label: 'Top', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 px-2 transition-colors duration-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center space-y-1 w-full h-full transition-all
              ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
