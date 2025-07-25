// src/components/Header.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User as UserIcon, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  studentName: string;
  activeTab: string; // <-- NEW: To know which tab is active
  onTabChange: (tab: string) => void; // <-- NEW: To switch tabs
  onProfileClick: () => void;
  onBellClick: () => void;
  unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ studentName, activeTab, onTabChange, onProfileClick, unreadCount, onBellClick }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex-shrink-0 bg-white shadow-md z-20 relative">
      {/* The main container is now a flexbox that justifies space between its children */}
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        
        {/* --- Left Side of Header --- */}
        <div>
          {activeTab === 'dashboard' ? (
            // [MOBILE & DESKTOP] On the dashboard, show the school logo and name.
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full" />
              <div>
                {/* [MOBILE] On small screens, just show the school name. */}
                <h1 className="text-md font-bold text-gray-800 lg:hidden">Marudhar Defence School</h1>
                {/* [DESKTOP] On large screens (lg and up), show the personalized welcome. */}
                <h1 className="text-md font-bold text-gray-800 hidden lg:block">Welcome, {studentName}!</h1>
                <p className="text-xs text-gray-500">Student & Parent Portal</p>
              </div>
            </div>
          ) : (
            // [MOBILE & DESKTOP] On any other tab, show a "Back to Dashboard" button.
            <button 
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-100"
            >
              <Home size={20} />
              {/* [DESKTOP] Show the "Dashboard" text on medium screens and up. */}
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}
        </div>

        {/* --- Right Side of Header --- */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={onBellClick} className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
              aria-label="Open user menu"
            >
              {studentName ? studentName.charAt(0).toUpperCase() : '?'}
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border origin-top-right z-30">
                <div className="p-2">
                  <div className="px-3 py-2 border-b">
                    <p className="font-semibold text-sm text-gray-800 truncate">{studentName}</p>
                    <p className="text-xs text-gray-500">Student Portal</p>
                  </div>
                  <div className="pt-2">
                    <button onClick={onProfileClick} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                      <UserIcon size={16} className="mr-3 text-gray-500" />
                      View Profile
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

