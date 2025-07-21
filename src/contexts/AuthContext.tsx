// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient'; // Make sure this path is correct
import { Student, LoginCredentials } from '../types';
import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd";

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
  
  // Use a ref to ensure OneSignal initializes only once.
  const oneSignalInitRef = useRef(false);

  // Effect to initialize OneSignal once on component mount.
  useEffect(() => {
    if (oneSignalInitRef.current) {
      return;
    }
    oneSignalInitRef.current = true; // Mark as initialized immediately

    const initOneSignal = async () => {
      try {
        await OneSignal.init({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
        console.log("OneSignal initialized successfully.");
      } catch (e) {
        console.error("Error initializing OneSignal:", e);
      }
    };
    initOneSignal();
  }, []); // Empty dependency array ensures it runs only once.

  // Effect to load student from localStorage (remains the same)
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
    // --- FIX: REMOVED the check for `isOneSignalInitialized` ---
    setIsLoading(true);
    
    try {
      // Your corrected login logic (fetching from both mediums) is correct.
      let { data, error } = await supabase.from('students').select('*').eq('sr_no', credentials.rollNumber).eq('medium', 'English').maybeSingle();
      if (!data) {
        const { data: hindiData, error: hindiError } = await supabase.from('students').select('*').eq('sr_no', credentials.rollNumber).eq('medium', 'Hindi').maybeSingle();
        if (hindiError) throw hindiError;
        if (!hindiData) return { success: false, error: 'SR Number not found in either medium.' };
        data = hindiData;
      }
      if (data.dob !== credentials.dateOfBirth) {
        return { success: false, error: 'Date of Birth does not match.' };
      }

      const loggedInStudent: Student = {
        // ... (mapping all student properties is correct)
        photoUrl: data.photo_url,
      };
      
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      // Identify the user and prompt for notifications
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
    // --- FIX: REMOVED `isOneSignalInitialized` from dependency array ---
  }, []);
      
  const logout = useCallback(async () => {
    // --- FIX: REMOVED the check for `isOneSignalInitialized` ---
    try {
      await OneSignal.removeExternalUserId();
      console.log("OneSignal external user ID removed.");
    } catch(e) {
      console.error("Error removing OneSignal user ID:", e);
    }
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');
    // --- FIX: REMOVED `isOneSignalInitialized` from dependency array ---
  }, []);
  
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};