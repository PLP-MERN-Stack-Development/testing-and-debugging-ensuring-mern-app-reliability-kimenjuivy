import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (todoData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/todos`, todoData);
      setTodos(prev => [response.data.data, ...prev]);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError(err.response?.data?.message || 'Failed to add todo. Please try again.');
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      setError(null);
      const response = await axios.patch(`${API_URL}/todos/${id}/toggle`);
      setTodos(prev =>
        prev.map(todo =>
          todo._id === id ? response.data.data : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '24px'
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#333',
            marginBottom: '32px'
          }}
        >
          MERN Todo Application
        </h1>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: '#ffeeee',
              color: '#cc0000',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #cc0000'
            }}
            data-testid="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Todo Form */}
        <TodoForm onSubmit={handleAddTodo} />

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: 'white',
              borderRadius: '8px'
            }}
            data-testid="loading"
          >
            Loading todos...
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;