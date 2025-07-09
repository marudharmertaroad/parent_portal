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

const Header: React.FC<HeaderProps> = ({ studentName, onLogout, onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-2"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0">
              <img className="h-8 w-8" src="/logo.png" alt="School Logo" />
            </div>
            <h1 className="ml-4 text-xl font-bold text-gray-800">Student Portal</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                {studentName.charAt(0)}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{studentName}</span>
            </div>
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