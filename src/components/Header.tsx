// src/components/Header.tsx (SIMPLIFIED)

import React from 'react';
import { Bell, Menu, LogOut } from 'lucide-react';

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