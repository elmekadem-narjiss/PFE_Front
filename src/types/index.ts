export interface Battery {
  id: string;
  name: string;
  capacity: number;
  voltage: number;
  temperature: number;
  stateOfCharge: number;
  chemistry: string;
  cycleCount: number;
  manufacturedDate: string | null;
  lastMaintenance: string | null;
  status: 'Operational' | 'Failed';
  lastChecked: string;
}