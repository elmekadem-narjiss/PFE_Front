'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Battery, simulateBatteryMonitoring, getBatteries } from '@/lib/batteryMonitoring';

interface BatteryContextType {
  batteries: Battery[];
  setBatteries: React.Dispatch<React.SetStateAction<Battery[]>>;
}

const BatteryContext = createContext<BatteryContextType | undefined>(undefined);

export function BatteryProvider({ children }: { children: React.ReactNode }) {
  const [batteries, setBatteries] = useState<Battery[]>(getBatteries());

  useEffect(() => {
    // Start monitoring batteries
    simulateBatteryMonitoring(async (updatedBatteries) => {
      setBatteries(updatedBatteries);

      // Check for failures and send notifications via API
      for (const battery of updatedBatteries) {
        if (battery.status === 'Failed') {
          try {
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: battery.id,
                voltage: battery.voltage,
                temperature: battery.temperature,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to send email via API');
            }

            const result = await response.json();
            console.log('Email API response:', result);
          } catch (error) {
            console.error('Error sending email via API:', error);
          }
        }
      }
    });
  }, []);

  return (
    <BatteryContext.Provider value={{ batteries, setBatteries }}>
      {children}
    </BatteryContext.Provider>
  );
}

export function useBatteryContext() {
  const context = useContext(BatteryContext);
  if (!context) {
    throw new Error('useBatteryContext must be used within a BatteryProvider');
  }
  return context;
}