// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Student, LoginCredentials } from '../types';
import { apiService } from '../services/api';
import OneSignal from 'react-onesignal';
import { isPlatform } from '@ionic/react';

declare global {
  interface Window {
    plugins: {
      OneSignal: any;
    };
  }
}

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

  useEffect(() => {
    // This event listener is crucial. It waits for the device to be ready.
    document.addEventListener('deviceready', () => {
      console.log("Device is ready, initializing OneSignal for native.");
      
      const OneSignal = window.plugins.OneSignal;
      
      // Set App ID for the native plugin
      OneSignal.setAppId(ONESIGNAL_APP_ID);

      // Prompt for push notification permission on the native device
      OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
        console.log("User accepted notifications: ", accepted);
      });
    }, false);
    
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

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Calls the original apiService.login function
      const loggedInStudent = await apiService.login(credentials);
      
      // Sets the state and saves the session
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      await OneSignal.setExternalUserId(loggedInStudent.srNo);
      console.log(`OneSignal user identified as: ${loggedInStudent.srNo}`);

      if (isPlatform('capacitor')) {
        // NATIVE APP LOGIC
        console.log(`Native App: Identifying user to OneSignal with sr_no: ${loggedInStudent.srNo}`);
        window.plugins.OneSignal.setExternalUserId(loggedInStudent.srNo);
      } else {
        // WEB BROWSER LOGIC (This will be ignored inside the app)
        // You can keep this for when you run the app in a regular browser for testing
        console.log("Web: OneSignal logic will be handled by the global script.");
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
  const logout = useCallback(() => {
    if (isPlatform('capacitor')) {

    window.plugins.OneSignal.removeExternalUserId();
    }
    setStudent(null);
    localStorage.removeItem('parentPortalStudzent');

    OneSignal.removeExternalUserId();
    console.log("OneSignal user logged out.");
  } ,[]);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};