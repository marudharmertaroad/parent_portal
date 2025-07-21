// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '../utils/supabaseClient';
import { Student, LoginCredentials } from '../types';

// Your OneSignal App ID
const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

// --- This flag ensures OneSignal.init() is only ever called once in the app's lifecycle ---
let oneSignalInitialized = false;

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

  // This useEffect handles initializing OneSignal and loading the student from localStorage
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize OneSignal only if it hasn't been done before
      if (!oneSignalInitialized) {
        try {
          await OneSignal.init({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
          oneSignalInitialized = true;
          console.log("OneSignal Initialized.");
        } catch (e) {
          console.error("OneSignal initialization error:", e);
        }
      }

      // Check for a saved session in localStorage
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
    };
    
    initializeApp();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
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

      // Now we call the OneSignal functions
      await OneSignal.setExternalUserId(loggedInStudent.srNo);
      await OneSignal.sendTag("sr_no", loggedInStudent.srNo);
      OneSignal.Slidedown.promptPush();
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(async () => {
    // This is the correct method provided by the react-onesignal SDK.
    // It will now work because OneSignal was initialized when the app started.
    await OneSignal.removeExternalUserId();
    
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');
    console.log("User logged out and OneSignal ID removed.");
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider> // <-- FIX: REMOVE THE HYPHEN
  );
};
