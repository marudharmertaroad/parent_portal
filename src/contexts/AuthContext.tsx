import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AuthUser, LoginCredentials } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  student: Student | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateStudent: (data: Partial<Student>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiService.verifyToken();
      if (response.success && response.data) {
        setStudent(response.data);
        setUser({
          studentId: response.data.id,
          rollNumber: response.data.rollNumber,
          class: response.data.class,
          isAuthenticated: true,
        });
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('studentData');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('studentData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { token, student: studentData } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('studentData', JSON.stringify(studentData));
        
        setStudent(studentData);
        setUser({
          studentId: studentData.id,
          rollNumber: studentData.rollNumber,
          class: studentData.class,
          isAuthenticated: true,
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setStudent(null);
  };

  const updateStudent = async (data: Partial<Student>) => {
    if (!student) return;
    
    try {
      const response = await apiService.updateStudentProfile(student.id, data);
      if (response.success && response.data) {
        setStudent(response.data);
        localStorage.setItem('studentData', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to update student profile:', error);
    }
  };

  const value = {
    user,
    student,
    isLoading,
    login,
    logout,
    updateStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};