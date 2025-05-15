export interface Battery {
  id: number; // Change from string to number
  name: string;
  capacity: number;
  voltage: number;
  stateOfCharge: number;
  chemistry: string;
  cycleCount: number;
  temperature: number;
  manufacturedDate: string | null;
  lastMaintenance: string | null;
  status: string;
  lastChecked: string;
}