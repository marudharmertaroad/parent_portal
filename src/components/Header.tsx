// src/components/Header.tsx (SIMPLIFIED)

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  studentName: string;
  studentMedium?: string;
  onProfileClick: () => void;
  onMenuClick: () => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
}


const Header: React.FC<HeaderProps> = ({
  studentName,
  studentMedium,
  onProfileClick,
  onMenuClick,
  onLogout,
  isMobileMenuOpen
}) => {
  
  return (
    <header className="flex-shrink-0 bg-white shadow-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Hamburger menu button for mobile */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        {/* This can be a placeholder or search bar on large screens */}
        <div className="hidden lg:block text-lg font-semibold text-gray-700">
          Student Dashboard
        </div>

        {/* Right-side icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;