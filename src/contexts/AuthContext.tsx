// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient'; // Make sure this path is correct
import { Student, LoginCredentials } from '../types'; // Make sure this path is correct

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

  // Checks for a saved session in localStorage when the app first loads.
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
      // Step 1: Fetch the complete student record from the database.
      const { data, error } = await supabase
        .from('students')
        .select('*') // This is crucial - it gets ALL columns, including photo_url.
        .eq('sr_no', credentials.rollNumber)
        .single(); // We expect exactly one student for this SR Number.

      if (error || !data) {
        console.error("Login query failed or student not found:", error);
        return { success: false, error: 'SR Number not found.' };
      }

      // Step 2: Verify the date of birth.
      if (data.dob !== credentials.dateOfBirth) {
        return { success: false, error: 'Date of Birth does not match.' };
      }

      // Step 3: Map the raw database data to our clean 'Student' TypeScript interface.
      // This is the most important part.
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
        photoUrl?: data.photo_url, // <-- THE MISSING PIECE, NOW CORRECTLY MAPPED
      };
      
      // Step 4: Save the complete student object to state and localStorage.
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
  }, []);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};