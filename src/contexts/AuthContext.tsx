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
      const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('sr_no', credentials.rollNumber)
  .single();

if (error || !data) {
  // handle error
  return;
}

// --- THIS IS THE CRITICAL STEP ---
// Create the correctly formatted student object before setting state.
const loggedInStudent: Student = {
  name: data.name,
  class: data.class,
  srNo: data.sr_no, // Mapped
  fatherName: data.father_name, // Mapped
  motherName: data.mother_name, // Mapped
  contact: data.contact,
  address: data.address,
  medium: data.medium,
  gender: data.gender,
  dob: data.dob,
  bus_route: data.bus_route, // Mapped
  category: data.category,
  nicStudentId: data.nic_student_id, // Mapped
  isRte: data.is_rte, // Mapped
  photoUrl: data.photo_url, // MAPPED!
};

// Now, use this correctly mapped object everywhere.
setStudent(loggedInStudent);
localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));
      
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