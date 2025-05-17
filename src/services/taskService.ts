import { Task } from '../types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/tasks';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (title: string, description: string, status: string = 'todo'): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, status }),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!response.ok) throw new Error('Failed to update task status');
  return response.json();
};

export const updateTask = async (id: number, title: string, description: string, status: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, description, status }),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
};