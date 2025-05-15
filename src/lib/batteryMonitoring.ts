import axios from 'axios';
import { Battery } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Define constants
//export const VOLTAGE_THRESHOLD = 3.0; // Example value in volts
export const TEMPERATURE_THRESHOLD = 45; // Example value in °C

export const getBatteries = async () => {
  const response = await api.get('/batteries');
  return response.data.map((battery: any) => ({
    ...battery,
    id: Number(battery.id),
  }));
};

export const getBattery = async (id: number) => {
  const response = await api.get(`/batteries/${id}`);
  const battery = response.data;
  return { ...battery, id: Number(battery.id) };
};

export const createBattery = async (battery: Omit<Battery, 'id'>) => {
  const response = await api.post('/batteries', battery);
  const createdBattery = response.data;
  return { ...createdBattery, id: Number(createdBattery.id) };
};

export const updateBattery = async (id: number, battery: Partial<Battery>) => {
  const response = await api.put(`/batteries/${id}`, battery);
  const updatedBattery = response.data;
  return { ...updatedBattery, id: Number(updatedBattery.id) };
};

export const deleteBattery = async (id: number) => {
  await api.delete(`/batteries/${id}`);
};