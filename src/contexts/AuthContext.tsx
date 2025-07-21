// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '../utils/supabaseClient';
import { Student, LoginCredentials } from '../types';

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

  // Load student from localStorage on initial app load
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
      // Login logic to fetch student data... (This part is correct)
      let { data, error } = await supabase.from('students').select('*').eq('sr_no', credentials.rollNumber).eq('medium', 'English').maybeSingle();
      if (!data && !error) {
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

      // --- THIS IS THE FINAL, CORRECTED ONESIGNAL LOGIC ---
      console.log("Login successful. Setting OneSignal properties...");

      // 1. Set the External User ID
      await OneSignal.setExternalUserId(loggedInStudent.srNo);
      console.log(`OneSignal External User ID set to: ${loggedInStudent.srNo}`);

      // 2. Send all tags in a single, reliable call
      await OneSignal.sendTags({
        sr_no: loggedInStudent.srNo,
        class: loggedInStudent.class,
        medium: loggedInStudent.medium,
      });
      console.log(`OneSignal tags sent:`, { sr_no: loggedInStudent.srNo, class: loggedInStudent.class, medium: loggedInStudent.medium });

      // 3. Prompt for notifications AFTER identifying the user.
      OneSignal.Slidedown.promptPush();
      
      return { success: true };
    } catch (error: any) {
      console.error("Login or OneSignal error:", error);
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(async () => {
    await OneSignal.removeExternalUserId();
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');
    console.log("User logged out and OneSignal ID removed.");
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};