import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react'; // Using icons for a clean look

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the title based on the current path
  // You can make this more sophisticated if needed
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/students')) return 'Students';
    if (path.startsWith('/fees')) return 'Fees';
    return 'Marudhar School'; // Default title
  };

  // The back button should not appear on the main dashboard page
  const showBackButton = location.pathname !== '/';

  const handleBack = () => {
    navigate(-1); // This is the magic! It goes back one step in history.
  };

  return (
    // The 'mobile-only' class will come from our CSS file
    <header className="mobile-only fixed top-0 left-0 right-0 bg-white h-16 flex items-center justify-between px-4 shadow-md z-40">
      <div className="flex items-center">
        {showBackButton ? (
          <button onClick={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
        ) : (
          // You could have a hamburger menu icon on the main page
          <div className="p-2 -ml-2 mr-2">
             <Menu size={24} className="text-gray-700" />
          </div>
        )}
        <h1 className="text-lg font-bold text-gray-800">{getTitle()}</h1>
      </div>
      
      {/* You can add other icons here, like notifications or a user profile */}
      <div>
        {/* Placeholder for other actions */}
      </div>
    </header>
  );
};

export default MobileHeader;