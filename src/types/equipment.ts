export interface EquipmentMetrics {
    temperature?: number;
    humidity?: number;
    energyProduced?: number;
    cpuUsage?: number;
    ramUsage?: number;
    storageUsed?: number;
    storageTotal?: number;
  }
  
  export interface StoredEquipmentData {
    equipmentId: string;
    type: string;
    metrics: { timestamp: string; metrics: EquipmentMetrics }[];
  }