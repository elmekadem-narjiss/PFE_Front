import { fetchTasks, createTask, updateTaskStatus, deleteTask, updateTask } from '../taskService';
import { Task } from '../../types/task';

// Mock de la fonction fetch
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('taskService', () => {
  test('fetchTasks should return tasks when API call succeeds', async () => {
    // Mock de la réponse de l'API
    const mockTasks: Task[] = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'todo', priority: 'high' },
      { id: 2, title: 'Task 2', description: 'Description 2', status: 'done', priority: 'low' },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    const tasks = await fetchTasks();

    expect(tasks).toEqual(mockTasks);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks');
  });

  test('fetchTasks should throw an error when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks');
  });
});