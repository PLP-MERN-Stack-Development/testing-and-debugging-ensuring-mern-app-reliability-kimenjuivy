const Todo = require('../models/Todo');

// Debugging helper
const logRequest = (req, action) => {
  console.log(`[${new Date().toISOString()}] ${action}:`, {
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params
  });
};

// Get all todos
exports.getAllTodos = async (req, res, next) => {
  try {
    logRequest(req, 'GET_ALL_TODOS');
    
    const { completed, priority } = req.query;
    const filter = {};
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Error in getAllTodos:', error);
    next(error);
  }
};

// Get single todo
exports.getTodoById = async (req, res, next) => {
  try {
    logRequest(req, 'GET_TODO_BY_ID');
    
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error in getTodoById:', error);
    next(error);
  }
};

// Create todo
exports.createTodo = async (req, res, next) => {
  try {
    logRequest(req, 'CREATE_TODO');
    
    const todo = await Todo.create(req.body);
    
    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error in createTodo:', error);
    next(error);
  }
};

// Update todo
exports.updateTodo = async (req, res, next) => {
  try {
    logRequest(req, 'UPDATE_TODO');
    
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error in updateTodo:', error);
    next(error);
  }
};

// Delete todo
exports.deleteTodo = async (req, res, next) => {
  try {
    logRequest(req, 'DELETE_TODO');
    
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTodo:', error);
    next(error);
  }
};

// Toggle todo completion
exports.toggleTodoComplete = async (req, res, next) => {
  try {
    logRequest(req, 'TOGGLE_TODO_COMPLETE');
    
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    await todo.toggleComplete();
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error in toggleTodoComplete:', error);
    next(error);
  }
};