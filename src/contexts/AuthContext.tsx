// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient'; // Make sure you import your supabase client
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

  // Checks for a saved session in localStorage when the app loads.
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

  // --- THIS IS THE CORRECTED AND SIMPLIFIED LOGIN FUNCTION ---
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Step 1: Fetch the student record using SR Number
      const { data, error } = await supabase
        .from('students')
        .select('*') // Select all columns, including photo_url
        .eq('sr_no', credentials.rollNumber)
        .single(); // Expect only one result

      // Handle query errors or if the student was not found
      if (error || !data) {
        console.error("Login query failed:", error);
        return { success: false, error: 'SR Number not found.' };
      }

      // Step 2: Verify the date of birth
      if (data.dob !== credentials.dateOfBirth) {
        return { success: false, error: 'Date of Birth does not match.' };
      }

      // Step 3: Map the database record to our TypeScript Student interface
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
        photoUrl: data.photo_url, // This now correctly includes the photo URL
      };
      
      // Step 4: Set the state and save the session
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

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
    // It's good practice to redirect to the login page after logout
    // window.location.href = '/login'; 
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};