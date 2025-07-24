import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styles
import { LayoutDashboard, Users, CircleDollarSign } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/fees', label: 'Fees', icon: CircleDollarSign },
];

const BottomNav = () => {
  return (
    // The 'mobile-only' class will come from our CSS file
    <nav className="mobile-only fixed bottom-0 left-0 right-0 bg-white h-16 flex justify-around items-center border-t border-gray-200 z-40">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          // The 'end' prop is important for the root path ('/') so it doesn't stay active for other routes
          end={item.path === '/'} 
          // NavLink automatically adds an 'active' class, which we can style.
          // Or we can use a function to apply styles directly.
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full text-xs transition-colors duration-200 ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
            }`
          }
        >
          <item.icon size={24} className="mb-1" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;