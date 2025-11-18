import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../../App';

// Mock axios
vi.mock('axios');

describe('Todo App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays todos on mount', async () => {
    const mockTodos = [
      { _id: '1', title: 'Test Todo 1', completed: false, priority: 'medium' },
      { _id: '2', title: 'Test Todo 2', completed: true, priority: 'high' }
    ];

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: mockTodos }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/todos')
    );
  });

  it('shows loading state while fetching todos', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(<App />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('displays error when fetching todos fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });
  });

  it('adds a new todo', async () => {
    const user = userEvent.setup();
    const existingTodos = [];
    const newTodo = {
      _id: '1',
      title: 'New Todo',
      description: 'Test description',
      priority: 'high',
      completed: false
    };

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: existingTodos }
    });

    axios.post.mockResolvedValueOnce({
      data: { success: true, data: newTodo }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByTestId('title-input'), 'New Todo');
    await user.type(screen.getByTestId('description-input'), 'Test description');
    await user.selectOptions(screen.getByTestId('priority-select'), 'high');

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/todos'),
      {
        title: 'New Todo',
        description: 'Test description',
        priority: 'high'
      }
    );
  });

  it('displays error when adding todo fails', async () => {
    const user = userEvent.setup();

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Validation failed' }
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await user.type(screen.getByTestId('title-input'), 'New Todo');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Validation failed');
    });
  });

  it('toggles todo completion', async () => {
    const user = userEvent.setup();
    const mockTodo = {
      _id: '1',
      title: 'Test Todo',
      completed: false,
      priority: 'medium'
    };

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: [mockTodo] }
    });

    axios.patch.mockResolvedValueOnce({
      data: {
        success: true,
        data: { ...mockTodo, completed: true }
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const toggleButton = screen.getByTestId('toggle-button');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/todos/1/toggle')
      );
    });
  });

  it('deletes a todo', async () => {
    const user = userEvent.setup();
    const mockTodo = {
      _id: '1',
      title: 'To Delete',
      completed: false,
      priority: 'medium'
    };

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: [mockTodo] }
    });

    axios.delete.mockResolvedValueOnce({
      data: { success: true }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });

    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/todos/1')
    );
  });

  it('filters todos and maintains state', async () => {
    const user = userEvent.setup();
    const mockTodos = [
      { _id: '1', title: 'Active Todo', completed: false, priority: 'high' },
      { _id: '2', title: 'Completed Todo', completed: true, priority: 'low' }
    ];

    axios.get.mockResolvedValueOnce({
      data: { success: true, data: mockTodos }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Active Todo')).toBeInTheDocument();
      expect(screen.getByText('Completed Todo')).toBeInTheDocument();
    });

    // Filter by completed
    await user.selectOptions(screen.getByTestId('status-filter'), 'completed');

    expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
    expect(screen.getByText('Completed Todo')).toBeInTheDocument();

    // Filter by active
    await user.selectOptions(screen.getByTestId('status-filter'), 'active');

    expect(screen.getByText('Active Todo')).toBeInTheDocument();
    expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
  });

  it('handles multiple todos operations in sequence', async () => {
    const user = userEvent.setup();

    // Initial fetch
    axios.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Add first todo
    const todo1 = { _id: '1', title: 'First Todo', completed: false, priority: 'high' };
    axios.post.mockResolvedValueOnce({
      data: { success: true, data: todo1 }
    });

    await user.type(screen.getByTestId('title-input'), 'First Todo');
    await user.selectOptions(screen.getByTestId('priority-select'), 'high');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('First Todo')).toBeInTheDocument();
    });

    // Add second todo
    const todo2 = { _id: '2', title: 'Second Todo', completed: false, priority: 'low' };
    axios.post.mockResolvedValueOnce({
      data: { success: true, data: todo2 }
    });

    await user.type(screen.getByTestId('title-input'), 'Second Todo');
    await user.selectOptions(screen.getByTestId('priority-select'), 'low');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Second Todo')).toBeInTheDocument();
    });

    // Verify both are present
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
  });
});