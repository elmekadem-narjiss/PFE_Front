import { render, screen, waitFor } from '@testing-library/react';
import TodolistPage from '../page';

describe('TodoListPage Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            { id: 1, title: 'Task 1', description: 'Description 1', status: 'todo', priority: 'high' },
            { id: 2, title: 'Task 2', description: 'Description 2', status: 'done', priority: 'low' },
          ]),
          {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders tasks fetched from the API', async () => {
    render(<TodolistPage />);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks');
  });
});