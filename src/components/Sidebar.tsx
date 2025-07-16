// src/components/Sidebar.tsx

import React from 'react';
import { Home, CreditCard, Award, BookOpen, X, Megaphone, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // We'll need this for the logout function

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose, studentName }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fees', name: 'Fee Details', icon: CreditCard },
    { id: 'academic', name: 'Academic Records', icon: Award },
    { id: 'homework', name: 'Homework', icon: BookOpen },
    { id: 'notices', name: 'Notice Board', icon: Megaphone },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl
    flex flex-col /* <-- Use flexbox for layout */
    transform transition-transform duration-300 ease-in-out
    lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      <div className={sidebarClasses}>
        {/* --- Sidebar Header --- */}
        <div className="flex-shrink-0 flex items-center justify-between h-20 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <img className="h-12 w-12 rounded-full border-2 border-white/50" src="/logo.png" alt="School Logo" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-white truncate">{studentName}</span>
              <span className="text-sm text-gray-400">Student Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-full text-gray-400 hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* --- Navigation --- */}
        <nav className="flex-grow mt-6 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center px-4 py-3.5 text-left rounded-xl mb-2 transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon className={`w-6 h-6 mr-4 transition-transform group-hover:scale-110 ${activeTab === item.id ? '' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="font-medium text-md">{item.name}</span>
            </button>
          ))}
        </nav>
        
        {/* --- Logout Button at the bottom --- */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3.5 text-left rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400"
          >
            <LogOut className="w-6 h-6 mr-4" />
            <span className="font-medium text-md">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;