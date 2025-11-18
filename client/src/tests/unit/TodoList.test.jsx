import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../../components/TodoList';

describe('TodoList Component', () => {
  const mockTodos = [
    { _id: '1', title: 'Todo 1', completed: false, priority: 'high' },
    { _id: '2', title: 'Todo 2', completed: true, priority: 'medium' },
    { _id: '3', title: 'Todo 3', completed: false, priority: 'low' }
  ];

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders all todos', () => {
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    expect(screen.getByTestId('stat-total')).toHaveTextContent('3');
    expect(screen.getByTestId('stat-active')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('1');
  });

  it('shows empty message when no todos', () => {
    render(<TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No todos yet');
  });

  it('filters todos by active status', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const statusFilter = screen.getByTestId('status-filter');
    await user.selectOptions(statusFilter, 'active');
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
    expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
  });

  it('filters todos by completed status', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const statusFilter = screen.getByTestId('status-filter');
    await user.selectOptions(statusFilter, 'completed');
    
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();
  });

  it('filters todos by high priority', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const priorityFilter = screen.getByTestId('priority-filter');
    await user.selectOptions(priorityFilter, 'high');
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();
  });

  it('filters todos by medium priority', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const priorityFilter = screen.getByTestId('priority-filter');
    await user.selectOptions(priorityFilter, 'medium');
    
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
  });

  it('filters todos by low priority', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const priorityFilter = screen.getByTestId('priority-filter');
    await user.selectOptions(priorityFilter, 'low');
    
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
  });

  it('combines status and priority filters', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    await user.selectOptions(screen.getByTestId('status-filter'), 'active');
    await user.selectOptions(screen.getByTestId('priority-filter'), 'high');
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();
  });

  it('shows filter message when no todos match', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    await user.selectOptions(screen.getByTestId('status-filter'), 'completed');
    await user.selectOptions(screen.getByTestId('priority-filter'), 'high');
    
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No todos match the selected filters');
  });

  it('shows all todos when "all" filter is selected', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    // Set specific filters first
    await user.selectOptions(screen.getByTestId('status-filter'), 'active');
    
    // Reset to all
    await user.selectOptions(screen.getByTestId('status-filter'), 'all');
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
  });

  it('updates statistics correctly', () => {
    const singleTodo = [
      { _id: '1', title: 'Only Todo', completed: true, priority: 'high' }
    ];
    
    render(<TodoList todos={singleTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    expect(screen.getByTestId('stat-total')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-active')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('1');
  });
});