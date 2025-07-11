// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, LoginCredentials } from '../types';
import { apiService } from '../services/api';
import { requestPermissionAndGetToken } from '../lib/firebase';

// Define the shape of the data the context will provide
interface AuthContextType {
  student: Student | null; // The currently logged-in student object
  isLoading: boolean;      // To show a loading spinner on app start
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create the Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect for checking the session is perfect. No changes needed.
  useEffect(() => {
    // ...
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Step 1: Log in the user using the API service
      const loggedInStudent = await apiService.login(credentials);
      
      // Step 2: If login is successful, save session and set state
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));
      setStudent(loggedInStudent);
      
      // --- THIS IS THE FIX: The logic is now inside the 'try' block ---
      try {
        console.log("Login successful, now requesting notification token...");
        // Step 3: Request permission and get the FCM token
        const fcmToken = await requestPermissionAndGetToken();

        if (fcmToken) {
          // Step 4: If we get a token, save it to the database via the apiService
          console.log("Saving FCM token to the database...");
          // We will create this 'saveFcmToken' function in the next step
          await apiService.saveFcmToken(loggedInStudent.id, fcmToken);
        }
      } catch (tokenError) {
        // Important: We DON'T fail the login if token registration fails.
        // The user is still logged in. We just log the error.
        console.error("Could not register for push notifications:", tokenError);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => { /* ... no changes needed ... */ }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};