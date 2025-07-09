import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MediumProvider } from './context/MediumContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user?.isAuthenticated ? <StudentPortal /> : <LoginForm />;
};

function App() {
  return (
    <MediumProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MediumProvider>
  );
}

export default App;