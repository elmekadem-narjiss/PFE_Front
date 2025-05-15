import axios from 'axios';
import { StoredEquipmentData } from '../types/equipment';

export const fetchEquipmentData = async (apiUrl: string): Promise<StoredEquipmentData[]> => {
  try {
    const response = await axios.get(`${apiUrl}/equipment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    throw new Error('Failed to fetch equipment data');
  }
};

export const simulateEquipmentData = async (apiUrl: string): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/equipment/simulate`);
  } catch (error) {
    console.error('Error simulating equipment data:', error);
    throw new Error('Failed to simulate equipment data');
  }
};