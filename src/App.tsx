// src/App.tsx

import React, { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';

const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

// This is the component that decides whether to show the login page or the main app
const AppContent: React.FC = () => {
  const { student, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return student ? <StudentPortal /> : <LoginForm />;
};

// This is the main App component
function App() {
  const initialized = useRef(false); // Use a ref to ensure this runs only once

  useEffect(() => {
    // Prevent initialization from running twice in React's Strict Mode (development)
    if (!initialized.current) {
      initialized.current = true;
      
      const initOneSignal = async () => {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true
        });
        console.log("OneSignal Initialized.");
      };
      
      initOneSignal();
    }
  }, []); // Empty dependency array ensures this runs only on mount

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;