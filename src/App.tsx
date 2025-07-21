import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';
import OneSignal from 'react-onesignal';

// Your OneSignal App ID should be here
const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

// AppContent remains the same, it correctly decides which view to show
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

// --- THIS IS THE CORRECTED MAIN APP COMPONENT ---
function App() {
  // This useEffect will run ONCE when the entire application first loads.
  useEffect(() => {
    const initializeOneSignal = async () => {
      // It's safe to run init here because App is the root component.
      await OneSignal.init({ 
        appId: ONESIGNAL_APP_ID, 
        allowLocalhostAsSecureOrigin: true 
      });
      console.log("OneSignal has been initialized in App.tsx.");
    };

    initializeOneSignal();
  }, []); // The empty dependency array ensures this runs only once.

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;