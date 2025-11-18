import React from 'react';

const TodoItem = ({ todo, onToggle, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#44ff44';
      default:
        return '#888';
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: todo.completed ? '#f0f0f0' : 'white',
        borderLeft: `4px solid ${getPriorityColor(todo.priority)}`
      }}
      data-testid={`todo-item-${todo._id}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: '0 0 8px 0',
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#888' : '#333'
            }}
            data-testid="todo-title"
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p
              style={{
                margin: '0 0 8px 0',
                color: '#666',
                fontSize: '14px'
              }}
              data-testid="todo-description"
            >
              {todo.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#888' }}>
            <span
              data-testid="todo-priority"
              style={{
                backgroundColor: getPriorityColor(todo.priority),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {todo.priority}
            </span>
            <span data-testid="todo-status">
              {todo.completed ? '✓ Completed' : '○ Pending'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onToggle(todo._id)}
            style={{
              padding: '8px 16px',
              backgroundColor: todo.completed ? '#ffaa00' : '#44aa44',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="toggle-button"
          >
            {todo.completed ? 'Undo' : 'Complete'}
          </button>
          <button
            onClick={() => onDelete(todo._id)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;