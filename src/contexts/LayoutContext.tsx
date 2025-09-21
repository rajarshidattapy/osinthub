// src/contexts/LayoutContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface LayoutContextType {
  rightRail: React.ReactNode;
  setRightRail: (node: React.ReactNode) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [rightRail, setRightRail] = useState<React.ReactNode>(null);

  return (
    <LayoutContext.Provider value={{ rightRail, setRightRail }}>
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