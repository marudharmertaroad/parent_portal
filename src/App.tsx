// src/App.tsx

import React, {useEffect, useRef} from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';
import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

const AppContent: React.FC = () => {
  // Get the session state from our context
  const { student, isLoading } = useAuth();

  // 1. Show a loading spinner while the context is checking localStorage for a saved session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. If loading is done and a student is logged in, show the main portal.
  //    Otherwise, show the login form.
  return student ? <StudentPortal /> : <LoginForm />;
};

function App() {
  const osInitialized = useRef(false);

  useEffect(() => {
    if (osInitialized.current) return;
    osInitialized.current = true;
    
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
      });
      console.log("OneSignal Initialized in App.tsx.");
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