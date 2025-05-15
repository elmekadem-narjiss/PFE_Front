'use client';

import { createContext, useContext, useState } from 'react';

interface Settings {
  apiUrl: string;
  influxDbOrg: string;
  influxDbBucket: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    apiUrl: typeof window !== 'undefined' ? localStorage.getItem('apiUrl') || 'http://localhost:5000/api' : 'http://localhost:5000/api',
    influxDbOrg: typeof window !== 'undefined' ? localStorage.getItem('influxDbOrg') || 'iot_lab' : 'iot_lab',
    influxDbBucket: typeof window !== 'undefined' ? localStorage.getItem('influxDbBucket') || 'energy_data' : 'energy_data',
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};