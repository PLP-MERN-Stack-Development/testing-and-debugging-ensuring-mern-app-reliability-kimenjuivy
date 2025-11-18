import React, { useState } from 'react';

const TodoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      setFormData({ title: '', description: '', priority: 'medium' });
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}
      data-testid="todo-form"
    >
      <h2 style={{ marginTop: 0 }}>Add New Todo</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter todo title"
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            border: `1px solid ${errors.title ? '#ff4444' : '#ddd'}`,
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
          data-testid="title-input"
        />
        {errors.title && (
          <span
            style={{ color: '#ff4444', fontSize: '14px', marginTop: '4px', display: 'block' }}
            data-testid="title-error"
          >
            {errors.title}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="description"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter todo description (optional)"
          rows="3"
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
          data-testid="description-input"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="priority"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
          data-testid="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#4444ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        data-testid="submit-button"
      >
        Add Todo
      </button>
    </form>
  );
};

export default TodoForm;