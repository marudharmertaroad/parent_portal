// src/components/Header.tsx

import React from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  studentName: string;
  onLogout: () => void;
  onMenuClick: () => void;
   onNotificationClick: () => void; // Prop to open the notices modal
  onProfileClick: () => void;      // Prop to open the profile modal
  unreadNotifications?: number; 
}

const Header: React.FC<HeaderProps> = ({ 
  studentName, 
  onLogout, 
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  unreadNotifications = 0
}) => {  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-2"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            {/* --- FIX: Logo is now round --- */}
            <img className="h-10 w-10 rounded-full" src="/logo.png" alt="School Logo" />
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onNotificationClick}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100" 
              title="View Alerts"
            >
              <Bell size={22} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </button>
            <div className="border-l pl-2">
              <button
                onClick={onLogout}
                className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;