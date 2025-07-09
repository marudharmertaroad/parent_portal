// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, LoginCredentials } from '../types';
import { apiService } from '../services/api';

// Define the shape of the data and functions the context will provide
interface AuthContextType {
  student: Student | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create the Provider component that will wrap our app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the app loads to check for a saved session
  useEffect(() => {
    try {
      const savedStudentData = localStorage.getItem('studentData');
      if (savedStudentData) {
        // If we find student data in localStorage, parse it and set it as the current user
        setStudent(JSON.parse(savedStudentData));
      }
    } catch (error) {
      console.error("Failed to parse student data from localStorage", error);
      // If parsing fails, clear the invalid data
      localStorage.removeItem('studentData');
    } finally {
      // We're done checking, so stop showing the initial loading spinner
      setIsLoading(false);
    }
  }, []);

  // The login function that the LoginForm will call
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Call our clean apiService login method
      const loggedInStudent = await apiService.login(credentials);
      
      // If successful, save the student data to localStorage and update the state
      localStorage.setItem('studentData', JSON.stringify(loggedInStudent));
      setStudent(loggedInStudent);
      
      return { success: true };
    } catch (error: any) {
      // If it fails, return the error message to be displayed on the login form
      return { 
        success: false, 
        error: error.message || 'An unknown error occurred.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // The logout function
  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem('studentData');
    // You could also redirect the user to the login page here if needed
  }, []);
  
  // The value that will be available to all components wrapped by this provider
  const value = {
    student,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};