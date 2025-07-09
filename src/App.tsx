// src/App.tsx

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal'; // We will create this next

// A small helper component to avoid calling useAuth() in App directly
const AppContent: React.FC = () => {
  const { student, isLoading } = useAuth();

  // Show a loading spinner while the context checks for a saved session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If loading is done and a student is logged in, show the portal.
  // Otherwise, show the login form.
  return student ? <StudentPortal /> : <LoginForm />;
};

function App() {
  return (
    // Wrap the entire application with the AuthProvider
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;