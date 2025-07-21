// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Student, LoginCredentials } from '../types';

// We NO LONGER import 'react-onesignal'.

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

  // useEffect for localStorage remains the same.
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
      // Supabase login logic is correct.
      let { data } = await supabase.from('students').select('*').eq('sr_no', credentials.rollNumber).eq('medium', 'English').maybeSingle();
      if (!data) {
        const { data: hindiData } = await supabase.from('students').select('*').eq('sr_no', credentials.rollNumber).eq('medium', 'Hindi').maybeSingle();
        data = hindiData;
      }
      if (!data) return { success: false, error: 'SR Number not found.' };
      if (data.dob !== credentials.dateOfBirth) return { success: false, error: 'Date of Birth does not match.' };

      const loggedInStudent: Student = {
        name: data.name, class: data.class, srNo: data.sr_no, fatherName: data.father_name,
        motherName: data.mother_name, contact: data.contact, address: data.address,
        medium: data.medium, gender: data.gender, dob: data.dob, bus_route: data.bus_route,
        category: data.category, nicStudentId: data.nic_student_id, isRte: data.is_rte,
        photoUrl: data.photo_url,
      };
      
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      // --- THE FINAL, GUARANTEED FIX ---
      // We use the official, global window.OneSignal.push() method.
      window.OneSignal.push(function() {
        window.OneSignal.setExternalUserId(loggedInStudent.srNo);
        window.OneSignal.sendTags({
          sr_no: loggedInStudent.srNo,
          class: loggedInStudent.class,
          medium: loggedInStudent.medium,
        });
        window.OneSignal.Slidedown.promptPush();
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(() => {
    // --- THIS IS THE FINAL, CORRECT LOGOUT METHOD ---
    window.OneSignal.push(function() {
      // To remove the user ID, you call setExternalUserId with an empty string or null.
      window.OneSignal.setExternalUserId(""); 
      console.log("OneSignal external user ID has been cleared.");
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