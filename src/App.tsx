// src/App.tsx

import React, { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';

// Your OneSignal App ID
const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

// The AppContent component decides which screen to show
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

// The main App component, responsible for initialization
function App() {
  const osInitialized = useRef(false);

  // This useEffect runs only ONCE when the app starts
  useEffect(() => {
    if (osInitialized.current) {
      return; // Prevent re-initialization in React Strict Mode
    }
    osInitialized.current = true;
    
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
      });
      console.log("OneSignal Initialized.");
    };
    
    initOneSignal();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;