import { createContext, useContext, useState, ReactNode } from 'react';
import { Battery } from '@/types';

interface BatteryContextType {
  batteries: Battery[];
  setBatteries: (batteries: Battery[] | ((prev: Battery[]) => Battery[])) => void;
}

const BatteryContext = createContext<BatteryContextType | undefined>(undefined);

export const BatteryProvider = ({ children }: { children: ReactNode }) => {
  const [batteries, setBatteries] = useState<Battery[]>([]);

  return (
    <BatteryContext.Provider value={{ batteries, setBatteries }}>
      {children}
    </BatteryContext.Provider>
  );
};

export const useBatteryContext = () => {
  const context = useContext(BatteryContext);
  if (!context) {
    throw new Error('useBatteryContext must be used within a BatteryProvider');
  }
  return context;
};