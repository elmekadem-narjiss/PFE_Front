import axios from 'axios';
import { Battery } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const getBatteries = async () => {
  const response = await api.get('/batteries');
  return response.data;
};

export const getBattery = async (id: number) => {
  const response = await api.get(`/batteries/${id}`);
  return response.data;
};

export const createBattery = async (battery: Omit<Battery, 'id'>) => {
  const response = await api.post('/batteries', battery);
  return response.data;
};

export const updateBattery = async (id: string | number, battery: Partial<Battery>) => {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid battery ID');
  }
  const response = await api.put(`/batteries/${numericId}`, battery);
  return response.data;
};

export const deleteBattery = async (id: string | number) => {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid battery ID');
  }
  await api.delete(`/batteries/${numericId}`);
};