// src/components/Sidebar.tsx

import React from 'react';
import { Home, CreditCard, Award, BookOpen, X , Megaphone} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fees', name: 'Fee Details', icon: CreditCard },
    { id: 'academic', name: 'Academic Records', icon: Award },
    { id: 'homework', name: 'Homework', icon: BookOpen },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform
    lg:relative lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <span className="text-lg font-bold text-blue-700">Navigation</span>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose(); // Close sidebar on mobile after selection
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