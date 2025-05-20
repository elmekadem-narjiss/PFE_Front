import { http, HttpResponse } from 'msw';
import { Task } from '../types/task';

export const handlers = [
  http.get('http://localhost:5000/api/tasks', () => {
    const mockTasks: Task[] = [
      { id: 1, title: 'Task 1', description: 'Description 1', status: 'todo', priority: 'high' },
      { id: 2, title: 'Task 2', description: 'Description 2', status: 'done', priority: 'low' },
    ];
    return HttpResponse.json(mockTasks);
  }),
];