// src/components/Sidebar.tsx

import React from 'react';
import { Home, CreditCard, Award, BookOpen, X , Megaphone} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  studentName: string; // <-- ADD THIS LINE
}
const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose, studentName }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fees', name: 'Fee Details', icon: CreditCard },
    { id: 'academic', name: 'Academic Records', icon: Award },
    { id: 'homework', name: 'Homework', icon: BookOpen },
    { id: 'notices', name: 'Notice Board', icon: Megaphone },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform
    lg:translate-x-0  // The sidebar is always translated on large screens
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      <div className={sidebarClasses}>
        {/* --- FIX: New Sidebar Header --- */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img className="h-10 w-10 rounded-full" src="/logo.png" alt="School Logo" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">{studentName}</span>
              <span className="text-xs text-gray-500">Student</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center px-4 py-3 text-left rounded-xl mb-2 transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={onClose}></div>}
    </>
  );
};


export default Sidebar;