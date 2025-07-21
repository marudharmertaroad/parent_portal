// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '../utils/supabaseClient';
import { Student, LoginCredentials } from '../types';

// Your OneSignal App ID from your OneSignal dashboard
const ONESIGNAL_APP_ID = "c8dca610-5f15-47e4-84f1-8943672e86dd"; // Make sure this is correct

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
  
  // A ref to ensure OneSignal initialization only runs once, preventing errors.
  const oneSignalInitRef = useRef(false);

  // Effect to initialize OneSignal once when the app loads.
  useEffect(() => {
    if (oneSignalInitRef.current) {
      return; // If already initialized, do nothing.
    }
    oneSignalInitRef.current = true; // Mark as initialized immediately.

    const initOneSignal = async () => {
      try {
        await OneSignal.init({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
        console.log("OneSignal initialized successfully.");
      } catch (e) {
        console.error("Error initializing OneSignal:", e);
      }
    };
    initOneSignal();
  }, []); // Empty dependency array ensures this runs only once.


  // Effect to check for a saved session in localStorage on initial app load.
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
await oneSignalReady;
      console.log("OneSignal is ready, proceeding with login.");
      
      let { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('sr_no', credentials.rollNumber)
        .eq('medium', 'English')
        .maybeSingle();

      // Step 2: If not found, try the 'Hindi' medium.
      if (!data && !error) {
        const { data: hindiData, error: hindiError } = await supabase
          .from('students')
          .select('*')
          .eq('sr_no', credentials.rollNumber)
          .eq('medium', 'Hindi')
          .maybeSingle();
        
        if (hindiError) throw hindiError;
        data = hindiData;
      }
      
      if (error) throw error;
      if (!data) return { success: false, error: 'SR Number not found in either medium.' };

      // Step 3: Verify the date of birth.
      if (data.dob !== credentials.dateOfBirth) {
        return { success: false, error: 'Date of Birth does not match.' };
      }

      // Step 4: Map the complete database record to our Student interface.
      const loggedInStudent: Student = {
        name: data.name,
        class: data.class,
        srNo: data.sr_no,
        fatherName: data.father_name,
        motherName: data.mother_name,
        contact: data.contact,
        address: data.address,
        medium: data.medium,
        gender: data.gender,
        dob: data.dob,
        bus_route: data.bus_route,
        category: data.category,
        nicStudentId: data.nic_student_id,
        isRte: data.is_rte,
        photoUrl: data.photo_url, // <-- Photo URL is correctly included
      };
      
      // Step 5: Update state, localStorage, and OneSignal.
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      await OneSignal.setExternalUserId(loggedInStudent.srNo);
      await OneSignal.sendTag("sr_no", loggedInStudent.srNo);
      OneSignal.Slidedown.promptPush();
      
      console.log(`OneSignal user identified and tagged with sr_no: ${loggedInStudent.srNo}`);

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(async () => {
    try {
      await OneSignal.removeExternalUserId();
      console.log("OneSignal external user ID removed.");
    } catch(e) {
      console.error("Error removing OneSignal user ID:", e);
    }
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