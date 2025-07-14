// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, LoginCredentials } from '../types';
import { apiService } from '../services/api';

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
    try {
      const savedStudentData = localStorage.getItem('parentPortalStudent');
      if (savedStudentData) {
        setStudent(JSON.parse(savedStudentData));
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
      // Step 1: Log in and get the student data
      const studentDataFromDB = await apiService.login(credentials);

      const loggedInStudent: Student = {
        id: studentDataFromDB.id,
        name: studentDataFromDB.name,
        class: studentDataFromDB.class,
        srNo: studentDataFromDB.sr_no,
        fatherName: studentDataFromDB.father_name,
        motherName: studentDataFromDB.mother_name,
        contact: studentDataFromDB.contact,
        address: studentDataFromDB.address,
        medium: studentDataFromDB.medium,
        gender: studentDataFromDB.gender,
        dob: studentDataFromDB.dob,
        bus_route: studentDataFromDB.bus_route,
        religion: studentDataFromDB.religion,
        nicStudentId: studentDataFromDB.nic_student_id,
        isRte: studentDataFromDB.is_rte,
      };

      // Step 3: Set the state and save the session to localStorage
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      return { success: true };
    } catch (error: any) {
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