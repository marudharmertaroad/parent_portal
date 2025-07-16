// src/components/Header.tsx (SIMPLIFIED)

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Define a single, clear interface for the props this component needs.
interface HeaderProps {
  studentName: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ studentName, onMenuClick }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Effect to close the dropdown if the user clicks outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex-shrink-0 bg-white shadow-md z-20 relative">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Hamburger menu button for mobile view */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        {/* Welcome message on larger screens */}
        <div className="hidden lg:block text-lg font-semibold text-gray-700">
          Welcome, {studentName}!
        </div>

        {/* Right-side action icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Notifications">
            <Bell size={20} />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
              aria-label="Open user menu"
            >
              {/* Safety Check: Ensure studentName exists before calling charAt */}
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
                    <button onClick={() => alert("Profile page coming soon!")} className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
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