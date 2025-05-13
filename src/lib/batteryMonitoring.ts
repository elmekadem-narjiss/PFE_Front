export interface Battery {
    id: string;
    name: string;
    capacity: number;
    voltage: number; // in volts
    temperature: number; // in Celsius
    stateOfCharge: number; // percentage (0-100)
    chemistry: string;
    cycleCount: number;
    manufacturedDate: string | null;
    lastMaintenance: string | null;
    status: 'Operational' | 'Failed';
    lastChecked: string;
  }
  
  // Mock data for batteries (aligned with the Battery type)
  const batteries: Battery[] = [
    {
      id: 'BAT001',
      name: 'Battery 1',
      capacity: 50,
      voltage: 3.7,
      temperature: 25,
      stateOfCharge: 80,
      chemistry: 'Li-ion',
      cycleCount: 100,
      manufacturedDate: '2023-01-15',
      lastMaintenance: null,
      status: 'Operational',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'BAT002',
      name: 'Battery 2',
      capacity: 60,
      voltage: 2.8,
      temperature: 50,
      stateOfCharge: 20,
      chemistry: 'Li-ion',
      cycleCount: 150,
      manufacturedDate: '2023-02-20',
      lastMaintenance: null,
      status: 'Operational',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'BAT003',
      name: 'Battery 3',
      capacity: 55,
      voltage: 3.5,
      temperature: 30,
      stateOfCharge: 60,
      chemistry: 'Li-ion',
      cycleCount: 120,
      manufacturedDate: '2023-03-10',
      lastMaintenance: null,
      status: 'Operational',
      lastChecked: new Date().toISOString(),
    },
  ];
  
  // Export the threshold constants
  export const VOLTAGE_THRESHOLD = 3.0; // Volts
  export const TEMPERATURE_THRESHOLD = 45; // Celsius
  
  // Function to check battery status and update state
  export function checkBatteryStatus(battery: Battery): Battery {
    const isFailed =
      battery.voltage < VOLTAGE_THRESHOLD || battery.temperature > TEMPERATURE_THRESHOLD;
    return {
      ...battery,
      status: isFailed ? 'Failed' : 'Operational',
      lastChecked: new Date().toISOString(),
    };
  }
  
  // Simulate battery monitoring by updating values periodically
  export function simulateBatteryMonitoring(callback: (updatedBatteries: Battery[]) => void) {
    setInterval(() => {
      const updatedBatteries = batteries.map((battery) => {
        // Simulate small fluctuations in voltage, temperature, and state of charge
        const newVoltage = battery.voltage + (Math.random() * 0.2 - 0.1); // Fluctuate by ±0.1V
        const newTemperature = battery.temperature + (Math.random() * 2 - 1); // Fluctuate by ±1°C
        const newStateOfCharge = Math.max(
          0,
          Math.min(100, battery.stateOfCharge + (Math.random() * 2 - 1)) // Fluctuate by ±1%
        );
  
        const updatedBattery = {
          ...battery,
          voltage: Number(newVoltage.toFixed(2)),
          temperature: Number(newTemperature.toFixed(1)),
          stateOfCharge: Number(newStateOfCharge.toFixed(1)),
        };
  
        return checkBatteryStatus(updatedBattery);
      });
  
      // Update the batteries array
      batteries.splice(0, batteries.length, ...updatedBatteries);
      callback(updatedBatteries);
    }, 10000); // Check every 10 seconds
  }
  
  // Function to get the current battery states
  export function getBatteries(): Battery[] {
    return batteries.map((battery) => checkBatteryStatus(battery));
  }
  
  // Function to add a new battery to the mock data
  export function addBattery(battery: Omit<Battery, 'id' | 'status' | 'lastChecked'>) {
    const newBattery: Battery = {
      ...battery,
      id: `BAT${(batteries.length + 1).toString().padStart(3, '0')}`,
      voltage: 3.7, // Default starting voltage
      temperature: battery.temperature ?? 25, // Use provided temperature or default to 25°C
      status: 'Operational',
      lastChecked: new Date().toISOString(),
    };
    batteries.push(checkBatteryStatus(newBattery));
  }
  
  // Function to update a battery in the mock data
  export function updateBatteryInMock(id: string, updates: Partial<Battery>) {
    const index = batteries.findIndex((b) => b.id === id);
    if (index !== -1) {
      batteries[index] = checkBatteryStatus({
        ...batteries[index],
        ...updates,
      });
    }
  }
  
  // Function to delete a battery from the mock data
  export function deleteBatteryFromMock(id: string) {
    const index = batteries.findIndex((b) => b.id === id);
    if (index !== -1) {
      batteries.splice(index, 1);
    }
  }