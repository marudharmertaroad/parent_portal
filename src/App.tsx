// src/App.tsx

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal'; // We will create this next

// A small helper component to keep our App clean
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

// The main App component
function App() {
  return (
    // Wrap the entire application with the AuthProvider so all components can access the context
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;