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
    // This function will run once when the component first mounts.
    
    // 1. Native App Initialization (for APK)
    // This listener waits for the Capacitor bridge to be ready.
    document.addEventListener('deviceready', () => {
      console.log("Device is ready, initializing OneSignal for native.");
      
      const oneSignalNative = window.plugins.OneSignal;
      
      oneSignalNative.setAppId(ONESIGNAL_APP_ID);
      oneSignalNative.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
        console.log("User accepted native notifications: ", accepted);
      });
    }, false);

    // 2. Web App Initialization (for Browser)
    // We also initialize the web SDK so you can test in the browser.
    const initializeWebOneSignal = async () => {
        if (!isPlatform('capacitor')) {
            await OneSignal.init({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
            console.log("OneSignal initialized for web.");
        }
    };
    initializeWebOneSignal();
    
    // 3. Check for a saved session in localStorage.
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
      const loggedInStudent = await apiService.login(credentials);
      
      setStudent(loggedInStudent);
      localStorage.setItem('parentPortalStudent', JSON.stringify(loggedInStudent));

      // Platform-aware user identification
      if (isPlatform('capacitor')) {
        console.log(`Native App: Identifying user with sr_no: ${loggedInStudent.srNo}`);
        window.plugins.OneSignal.setExternalUserId(loggedInStudent.srNo);
      } else {
        console.log(`Web: Identifying user with sr_no: ${loggedInStudent.srNo}`);
        await OneSignal.setExternalUserId(loggedInStudent.srNo);
        await OneSignal.sendTag("sr_no", loggedInStudent.srNo);
        OneSignal.Slidedown.promptPush(); // Only prompt on the web
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);
      
   const logout = useCallback(async () => {
    // Platform-aware logout
    if (isPlatform('capacitor')) {
      // The native plugin uses removeExternalUserId
      await window.plugins.OneSignal.removeExternalUserId();
      console.log("Native OneSignal user ID removed.");
    } else {
      // --- THIS IS THE FIX for the WEB SDK ---
      // To remove the user ID, you call setExternalUserId with null
      await OneSignal.setExternalUserId(null);
      console.log("Web OneSignal external user ID removed.");
      // --- END OF FIX ---
    }
    
    setStudent(null);
    localStorage.removeItem('parentPortalStudent');
  } ,[]);
  
  const value = { student, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};