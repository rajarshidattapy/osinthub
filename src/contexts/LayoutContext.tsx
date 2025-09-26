// src/contexts/LayoutContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface LayoutContextType {
  rightRail: React.ReactNode;
  setRightRail: (node: React.ReactNode) => void;
  title: string;
  setTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [rightRail, setRightRail] = useState<React.ReactNode>(null);
  const [title, setTitle] = useState<string>('OSINT Hub');

  return (
    <LayoutContext.Provider value={{ rightRail, setRightRail, title, setTitle }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};