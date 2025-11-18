const Todo = require('../../src/models/Todo');
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete
} = require('../../src/controllers/todoController');

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  method: 'GET',
  path: '/test'
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Todo Controller Unit Tests', () => {
  
  describe('getAllTodos', () => {
    it('should return all todos', async () => {
      const todos = [
        { title: 'Test 1', completed: false },
        { title: 'Test 2', completed: true }
      ];
      
      await Todo.create(todos);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllTodos(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: expect.any(Array)
      });
    });
    
    it('should filter todos by completed status', async () => {
      await Todo.create([
        { title: 'Incomplete', completed: false },
        { title: 'Complete', completed: true }
      ]);
      
      const req = mockRequest({}, {}, { completed: 'true' });
      const res = mockResponse();
      
      await getAllTodos(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.count).toBe(1);
      expect(response.data[0].completed).toBe(true);
    });
    
    it('should filter todos by priority', async () => {
      await Todo.create([
        { title: 'High Priority', priority: 'high' },
        { title: 'Low Priority', priority: 'low' }
      ]);
      
      const req = mockRequest({}, {}, { priority: 'high' });
      const res = mockResponse();
      
      await getAllTodos(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.count).toBe(1);
      expect(response.data[0].priority).toBe('high');
    });
  });
  
  describe('getTodoById', () => {
    it('should return a todo by id', async () => {
      const todo = await Todo.create({ title: 'Test Todo' });
      
      const req = mockRequest({}, { id: todo._id.toString() });
      const res = mockResponse();
      
      await getTodoById(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: 'Test Todo'
        })
      });
    });
    
    it('should return 404 if todo not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const req = mockRequest({}, { id: fakeId });
      const res = mockResponse();
      
      await getTodoById(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Todo not found'
      });
    });
  });
  
  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Test description',
        priority: 'high'
      };
      
      const req = mockRequest(todoData);
      const res = mockResponse();
      
      await createTodo(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: 'New Todo',
          description: 'Test description',
          priority: 'high'
        })
      });
    });
    
    it('should handle validation errors', async () => {
      const invalidData = { title: 'ab' }; // Too short
      
      const req = mockRequest(invalidData);
      const res = mockResponse();
      
      await createTodo(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });
  
  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const todo = await Todo.create({ title: 'Original Title' });
      const updateData = { title: 'Updated Title' };
      
      const req = mockRequest(updateData, { id: todo._id.toString() });
      const res = mockResponse();
      
      await updateTodo(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.title).toBe('Updated Title');
    });
    
    it('should return 404 if todo not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const req = mockRequest({ title: 'Update' }, { id: fakeId });
      const res = mockResponse();
      
      await updateTodo(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
  
  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create({ title: 'To Delete' });
      
      const req = mockRequest({}, { id: todo._id.toString() });
      const res = mockResponse();
      
      await deleteTodo(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Todo deleted successfully'
      });
      
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });
    
    it('should return 404 if todo not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const req = mockRequest({}, { id: fakeId });
      const res = mockResponse();
      
      await deleteTodo(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
  
  describe('toggleTodoComplete', () => {
    it('should toggle todo completion status', async () => {
      const todo = await Todo.create({ title: 'Toggle Test', completed: false });
      
      const req = mockRequest({}, { id: todo._id.toString() });
      const res = mockResponse();
      
      await toggleTodoComplete(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.completed).toBe(true);
    });
    
    it('should return 404 if todo not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const req = mockRequest({}, { id: fakeId });
      const res = mockResponse();
      
      await toggleTodoComplete(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});