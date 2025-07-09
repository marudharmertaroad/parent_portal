import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MediumContextType {
  medium: string | null;
  setMedium: (medium: string) => void;
}

const MediumContext = createContext<MediumContextType | undefined>(undefined);

export const useMedium = () => {
  const context = useContext(MediumContext);
  if (context === undefined) {
    throw new Error('useMedium must be used within a MediumProvider');
  }
  return context;
};

interface MediumProviderProps {
  children: ReactNode;
}

export const MediumProvider: React.FC<MediumProviderProps> = ({ children }) => {
  const [medium, setMediumState] = useState<string | null>(null);

  useEffect(() => {
    // Get medium from localStorage or default to English
    const savedMedium = localStorage.getItem('selectedMedium') || 'English';
    setMediumState(savedMedium);
  }, []);

  const setMedium = (newMedium: string) => {
    setMediumState(newMedium);
    localStorage.setItem('selectedMedium', newMedium);
  };

  const value = {
    medium,
    setMedium,
  };

  return (
    <MediumContext.Provider value={value}>
      {children}
    </MediumContext.Provider>
  );
};