import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../../components/TodoForm';

describe('TodoForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('updates title input value', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByTestId('title-input');
    await user.type(titleInput, 'New Todo');
    
    expect(titleInput).toHaveValue('New Todo');
  });

  it('updates description input value', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const descInput = screen.getByTestId('description-input');
    await user.type(descInput, 'Test description');
    
    expect(descInput).toHaveValue('Test description');
  });

  it('updates priority select value', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const prioritySelect = screen.getByTestId('priority-select');
    await user.selectOptions(prioritySelect, 'high');
    
    expect(prioritySelect).toHaveValue('high');
  });

  it('shows error when title is empty', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);
    
    expect(screen.getByTestId('title-error')).toHaveTextContent('Title is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows error when title is too short', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByTestId('title-input');
    await user.type(titleInput, 'ab');
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);
    
    expect(screen.getByTestId('title-error')).toHaveTextContent('at least 3 characters');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    // Submit to trigger error
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);
    expect(screen.getByTestId('title-error')).toBeInTheDocument();
    
    // Type to clear error
    const titleInput = screen.getByTestId('title-input');
    await user.type(titleInput, 'N');
    
    expect(screen.queryByTestId('title-error')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByTestId('title-input'), 'Valid Todo');
    await user.type(screen.getByTestId('description-input'), 'Test description');
    await user.selectOptions(screen.getByTestId('priority-select'), 'high');
    
    await user.click(screen.getByTestId('submit-button'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Valid Todo',
      description: 'Test description',
      priority: 'high'
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByTestId('title-input');
    const descInput = screen.getByTestId('description-input');
    const prioritySelect = screen.getByTestId('priority-select');
    
    await user.type(titleInput, 'Test Todo');
    await user.type(descInput, 'Test description');
    await user.selectOptions(prioritySelect, 'low');
    
    await user.click(screen.getByTestId('submit-button'));
    
    expect(titleInput).toHaveValue('');
    expect(descInput).toHaveValue('');
    expect(prioritySelect).toHaveValue('medium');
  });

  it('trims whitespace from title', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByTestId('title-input'), '   Valid Todo   ');
    await user.click(screen.getByTestId('submit-button'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: '   Valid Todo   ',
      description: '',
      priority: 'medium'
    });
  });

  it('defaults priority to medium', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('priority-select')).toHaveValue('medium');
  });

  it('allows submission without description', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByTestId('title-input'), 'Title Only');
    await user.click(screen.getByTestId('submit-button'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Title Only',
      description: '',
      priority: 'medium'
    });
  });
});