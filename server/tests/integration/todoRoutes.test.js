const request = require('supertest');
const app = require('../../src/server');
const Todo = require('../../src/models/Todo');

describe('Todo Routes Integration Tests', () => {
  
  describe('GET /api/todos', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get('/api/todos');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });
    
    it('should return all todos', async () => {
      await Todo.create([
        { title: 'Todo 1', description: 'First todo' },
        { title: 'Todo 2', description: 'Second todo' }
      ]);
      
      const res = await request(app).get('/api/todos');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });
    
    it('should filter todos by completed status', async () => {
      await Todo.create([
        { title: 'Incomplete', completed: false },
        { title: 'Complete', completed: true }
      ]);
      
      const res = await request(app).get('/api/todos?completed=true');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].completed).toBe(true);
    });
    
    it('should filter todos by priority', async () => {
      await Todo.create([
        { title: 'High Priority Task', priority: 'high' },
        { title: 'Low Priority Task', priority: 'low' }
      ]);
      
      const res = await request(app).get('/api/todos?priority=high');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].priority).toBe('high');
    });
  });
  
  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Test description',
        priority: 'high'
      };
      
      const res = await request(app)
        .post('/api/todos')
        .send(todoData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        title: 'New Todo',
        description: 'Test description',
        priority: 'high',
        completed: false
      });
      expect(res.body.data._id).toBeDefined();
    });
    
    it('should reject todo without title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ description: 'No title' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });
    
    it('should reject todo with short title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'ab' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 3 characters');
    });
    
    it('should reject invalid priority', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Valid Title', priority: 'invalid' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should create todo with default values', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Minimal Todo' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.priority).toBe('medium');
    });
  });
  
  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      const todo = await Todo.create({
        title: 'Specific Todo',
        description: 'Finding this one'
      });
      
      const res = await request(app).get(`/api/todos/${todo._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Specific Todo');
    });
    
    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/todos/${fakeId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Todo not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/todos/invalid-id');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID');
    });
  });
  
  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const todo = await Todo.create({ title: 'Original' });
      
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: 'Updated', description: 'New description' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.description).toBe('New description');
    });
    
    it('should update only provided fields', async () => {
      const todo = await Todo.create({
        title: 'Original',
        description: 'Original description',
        priority: 'low'
      });
      
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ priority: 'high' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Original');
      expect(res.body.data.priority).toBe('high');
    });
    
    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/todos/${fakeId}`)
        .send({ title: 'Updated' });
      
      expect(res.statusCode).toBe(404);
    });
    
    it('should validate updated data', async () => {
      const todo = await Todo.create({ title: 'Valid Todo' });
      
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: 'ab' }); // Too short
      
      expect(res.statusCode).toBe(400);
    });
  });
  
  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create({ title: 'To Delete' });
      
      const res = await request(app).delete(`/api/todos/${todo._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Todo deleted successfully');
      
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });
    
    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).delete(`/api/todos/${fakeId}`);
      
      expect(res.statusCode).toBe(404);
    });
  });
  
  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle todo from incomplete to complete', async () => {
      const todo = await Todo.create({
        title: 'Toggle Test',
        completed: false
      });
      
      const res = await request(app).patch(`/api/todos/${todo._id}/toggle`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completed).toBe(true);
    });
    
    it('should toggle todo from complete to incomplete', async () => {
      const todo = await Todo.create({
        title: 'Toggle Test',
        completed: true
      });
      
      const res = await request(app).patch(`/api/todos/${todo._id}/toggle`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(false);
    });
    
    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).patch(`/api/todos/${fakeId}/toggle`);
      
      expect(res.statusCode).toBe(404);
    });
  });
  
  describe('GET /health', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});