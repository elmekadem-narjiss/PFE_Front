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

export const updateBattery = async (id: number, battery: Partial<Battery>) => {
  const response = await api.put(`/batteries/${id}`, battery);
  return response.data;
};

export const deleteBattery = async (id: number) => {
  await api.delete(`/batteries/${id}`);
};