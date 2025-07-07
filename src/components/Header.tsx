import React from 'react';
import { Bell, User, Menu, X, LogOut } from 'lucide-react';

interface HeaderProps {
  studentName: string;
  studentMedium?: string;
  unreadNotifications: number;
  onNotificationClick: () => void;
  onProfileClick: () => void;
  onMenuClick: () => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  studentName,
  studentMedium,
  unreadNotifications,
  onNotificationClick,
  onProfileClick,
  onMenuClick,
  onLogout,
  isMobileMenuOpen
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                <img 
                  src="/logo.png" 
                  alt="Marudhar Defence Educational Group" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Welcome, {studentName}</p>
                  {studentMedium && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {studentMedium}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={onProfileClick}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <User size={20} />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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