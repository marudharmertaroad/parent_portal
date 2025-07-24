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
    const initializeAuth = async () => {
      try {
        const savedStudentData = localStorage.getItem('parentPortalStudent');
        if (savedStudentData) {
          const storedStudent: Student = JSON.parse(savedStudentData);
          
          // 1. Set the stale data immediately for a fast UI load.
          // The user sees the old profile instantly.
          setStudent(storedStudent);
          
          // 2. In the background, fetch the LATEST data from the database.
          console.log("AuthContext: Refreshing student data in the background...");
          const freshStudentData = await apiService.getStudentBySrNo(storedStudent.srNo);
          
          // 3. Update the state and localStorage with the fresh data.
          // The UI will seamlessly update if anything changed (like the photo).
          setStudent(freshStudentData);
          localStorage.setItem('parentPortalStudent', JSON.stringify(freshStudentData));
          console.log("AuthContext: Student data has been refreshed.");
        }
      } catch (error) {
        console.error("Auth initialization/refresh failed:", error);
        // If the refresh fails (e.g., student was deleted), log them out.
        localStorage.removeItem('parentPortalStudent');
        setStudent(null);
      } finally {
        // We are finished loading, whether we found a user or not.
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      
      // 1. Call the service. It returns the fully mapped student object.
      const loggedInStudent = await apiService.login(credentials);
      
      // 2. Save that perfect object to state and localStorage.
      // `loggedInStudent.photoUrl` is now correctly set.
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
    // --- OneSignal logout logic ---
    window.OneSignal.push(function() {
      window.OneSignal.logout();
    });

    // 3. Delegate logout to the service (optional but good practice)
    apiService.logout();
    
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