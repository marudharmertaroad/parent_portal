// src/contexts/AuthContext.tsx
// --- NEW DEBUGGING VERSION ---

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, LoginCredentials } from '../types';
import { apiService } from '../services/api';

// The AuthContextType interface remains the same
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

  // This useEffect for checking the session is fine.
  useEffect(() => {
    try {
      const savedStudentData = localStorage.getItem('parentPortalStudent');
      if (savedStudentData) {
        const parsedStudent = JSON.parse(savedStudentData);
        console.log("AUTH_CONTEXT | Loaded student from localStorage:", parsedStudent);
        setStudent(parsedStudent);
      }
    } catch (error) {
      console.error("Failed to parse student data from localStorage", error);
      localStorage.removeItem('parentPortalStudent');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Step 1: Call the API service to log in.
      const responseFromApi = await apiService.login(credentials);
      
      // --- CRUCIAL DEBUG LOG ---
      // Let's see exactly what the apiService returned to the AuthContext.
      console.log("AUTH_CONTEXT | Received this object from apiService.login:", responseFromApi);
      // -------------------------

      if (!responseFromApi || !responseFromApi.user_id) {
        // If the object from the API is missing the user_id, we must stop here.
        throw new Error("Login failed: The server response was incomplete and missing a user_id.");
      }
      
      // --- FORCEFUL FIX ---
      // We will now create the final student object ourselves to be 100% sure it has the user_id.
      const studentDataToSave: Student = {
        // Copy all properties from the API response
        ...responseFromApi, 
        // Explicitly ensure user_id is set
        user_id: responseFromApi.user_id 
      };

      console.log("AUTH_CONTEXT | This is the final object being saved to state and localStorage:", studentDataToSave);
      
      // Step 2: Set the state and save the session to localStorage
      setStudent(studentDataToSave);
      localStorage.setItem('parentPortalStudent', JSON.stringify(studentDataToSave));

      return { success: true };
    } catch (error: any) {
      console.error("AUTH_CONTEXT | Login function caught an error:", error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(() => {
    console.log('[AUTH] Logging out.');
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