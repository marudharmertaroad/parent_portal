// src/App.tsx

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import StudentPortal from './components/StudentPortal';

// No more OneSignal imports, useEffects, or refs.

const AppContent: React.FC = () => {
  const { student, isLoading } = useAuth();
  if (isLoading) { /* ... loading spinner ... */ }
  return student ? <StudentPortal /> : <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;