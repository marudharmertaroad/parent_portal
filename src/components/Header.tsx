// src/components/Header.tsx (SIMPLIFIED)

import React from 'react';
import { ParentNotificationBell } from './ParentNotificationBell';
import { Bell, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadNotifications: number;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onMenuClick, onNotificationClick, unreadNotifications }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1"></div> {/* This empty div pushes the icons to the right */}
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
    </header>
  );
};

export default Header;