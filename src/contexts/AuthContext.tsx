// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// 1. Import the service, NOT the supabase client or individual functions
import { apiService } from '../services/api';
import { Student, LoginCredentials } from '../types';

// We are interacting with the global window.OneSignal object
declare global {
  interface Window {
    OneSignal: any;
  }
}

interface AuthContextType {
  student: Student | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect correctly loads the student from localStorage
  useEffect(() => {
    try {
      const savedStudentData = localStorage.getItem('parentPortalStudent');
      if (savedStudentData) {
        setStudent(JSON.parse(savedStudentData));
      }
    } catch (error) {
      console.error("Failed to parse student data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 2. Delegate the actual login logic to the apiService
      const loggedInStudent = await apiService.login(credentials);
      
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      // --- OneSignal logic remains here, as it's a side-effect of login ---
      window.OneSignal.push(async function() {
        await window.OneSignal.login(loggedInStudent.srNo);
        await window.OneSignal.sendTags({
          sr_no: loggedInStudent.srNo,
          class: loggedInStudent.class,
          medium: loggedInStudent.medium,
        });
        window.OneSignal.Slidedown.promptPush();
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Login context error:", error);
      return { success: false, error: error.message || "An unexpected error occurred." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(() => {
    // --- THE FINAL, CORRECTED LOGOUT METHOD ---
    window.OneSignal.push(async function() {
      // Use the modern `logout` method.
      await window.OneSignal.logout();
      console.log("OneSignal user logged out.");
    });
    
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};