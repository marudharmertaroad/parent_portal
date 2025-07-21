// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  // Checks for a saved session in localStorage when the app first loads
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
      // --- THIS IS THE NEW, CORRECTED LOGIC ---

      // Step 1: Try to find the student in the 'English' medium first.
      let { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('sr_no', credentials.rollNumber)
        .eq('medium', 'English') // Add the medium filter
        .maybeSingle(); // Use maybeSingle() to prevent errors if not found

      // Step 2: If not found in English, try to find them in the 'Hindi' medium.
      if (!data) {
        const { data: hindiData, error: hindiError } = await supabase
          .from('students')
          .select('*')
          .eq('sr_no', credentials.rollNumber)
          .eq('medium', 'Hindi') // Try the other medium
          .maybeSingle();
        
        // If there was an error in the second query, throw it
        if (hindiError) throw hindiError;
        
        // If still not found after checking both, it's an invalid SR Number.
        if (!hindiData) {
            return { success: false, error: 'SR Number not found in either medium.' };
        }
        // If found in Hindi, use that data
        data = hindiData;
      }

      // Step 3: Now that we have a unique student record, verify the date of birth.
      if (data.dob !== credentials.dateOfBirth) {
        return { success: false, error: 'Date of Birth does not match.' };
      }

      // Step 4: Map the data and save the session (this part is the same as before).
      const loggedInStudent: Student = {
        srNo: data.sr_no,
        name: data.name,
        class: data.class,
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
        photoUrl: data.photo_url,
      };
      
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

       await OneSignal.setExternalUserId(loggedInStudent.srNo);

          // ALSO, add a "tag" with their SRN
          await OneSignal.sendTag("sr_no", loggedInStudent.srNo);
          
          console.log(`OneSignal user identified and tagged with sr_no: ${loggedInStudent.srNo}`);
          // --- END OF UPDATE ---

          return { success: true };

    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');

    OneSignal.setExternalUserId(null); 
    
    console.log("OneSignal external user ID removed.");
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};