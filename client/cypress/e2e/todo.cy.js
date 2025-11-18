describe('Todo Application E2E Tests', () => {
  const API_URL = 'http://localhost:5000/api';

  beforeEach(() => {
    // Clear database before each test
    cy.request('DELETE', `${API_URL}/todos/test-cleanup`).then(() => {
      cy.visit('http://localhost:5173');
    });
  });

  it('loads the application', () => {
    cy.contains('MERN Todo Application').should('be.visible');
    cy.get('[data-testid="todo-form"]').should('be.visible');
  });

  it('creates a new todo', () => {
    cy.get('[data-testid="title-input"]').type('E2E Test Todo');
    cy.get('[data-testid="description-input"]').type('Created via Cypress');
    cy.get('[data-testid="priority-select"]').select('high');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('E2E Test Todo').should('be.visible');
    cy.contains('Created via Cypress').should('be.visible');
    cy.get('[data-testid="todo-priority"]').should('contain', 'high');
  });

  it('shows validation error for empty title', () => {
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="title-error"]').should('contain', 'Title is required');
  });

  it('shows validation error for short title', () => {
    cy.get('[data-testid="title-input"]').type('ab');
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="title-error"]').should('contain', 'at least 3 characters');
  });

  it('completes a todo', () => {
    // Create a todo
    cy.get('[data-testid="title-input"]').type('Todo to Complete');
    cy.get('[data-testid="submit-button"]').click();

    // Wait for todo to appear
    cy.contains('Todo to Complete').should('be.visible');

    // Complete it
    cy.get('[data-testid="toggle-button"]').first().click();

    // Verify it's completed
    cy.get('[data-testid="todo-status"]').first().should('contain', '✓ Completed');
    cy.get('[data-testid="toggle-button"]').first().should('contain', 'Undo');
  });

  it('uncompletes a completed todo', () => {
    // Create and complete a todo
    cy.get('[data-testid="title-input"]').type('Todo to Uncomplete');
    cy.get('[data-testid="submit-button"]').click();
    cy.contains('Todo to Uncomplete').should('be.visible');
    cy.get('[data-testid="toggle-button"]').first().click();
    cy.get('[data-testid="todo-status"]').first().should('contain', '✓ Completed');

    // Uncomplete it
    cy.get('[data-testid="toggle-button"]').first().click();

    // Verify it's active again
    cy.get('[data-testid="todo-status"]').first().should('contain', '○ Pending');
    cy.get('[data-testid="toggle-button"]').first().should('contain', 'Complete');
  });

  it('deletes a todo', () => {
    // Create a todo
    cy.get('[data-testid="title-input"]').type('Todo to Delete');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('Todo to Delete').should('be.visible');

    // Delete it
    cy.get('[data-testid="delete-button"]').first().click();

    // Verify it's gone
    cy.contains('Todo to Delete').should('not.exist');
    cy.get('[data-testid="empty-message"]').should('contain', 'No todos yet');
  });

  it('filters todos by status', () => {
    // Create active and completed todos
    cy.get('[data-testid="title-input"]').type('Active Todo');
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="title-input"]').type('Completed Todo');
    cy.get('[data-testid="submit-button"]').click();
    cy.contains('Completed Todo').should('be.visible');
    cy.get('[data-testid="toggle-button"]').first().click();

    // Filter by active
    cy.get('[data-testid="status-filter"]').select('active');
    cy.contains('Active Todo').should('be.visible');
    cy.contains('Completed Todo').should('not.exist');

    // Filter by completed
    cy.get('[data-testid="status-filter"]').select('completed');
    cy.contains('Completed Todo').should('be.visible');
    cy.contains('Active Todo').should('not.exist');

    // Show all
    cy.get('[data-testid="status-filter"]').select('all');
    cy.contains('Active Todo').should('be.visible');
    cy.contains('Completed Todo').should('be.visible');
  });

  it('filters todos by priority', () => {
    // Create todos with different priorities
    cy.get('[data-testid="title-input"]').type('High Priority');
    cy.get('[data-testid="priority-select"]').select('high');
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="title-input"]').type('Low Priority');
    cy.get('[data-testid="priority-select"]').select('low');
    cy.get('[data-testid="submit-button"]').click();

    // Filter by high priority
    cy.get('[data-testid="priority-filter"]').select('high');
    cy.contains('High Priority').should('be.visible');
    cy.contains('Low Priority').should('not.exist');

    // Filter by low priority
    cy.get('[data-testid="priority-filter"]').select('low');
    cy.contains('Low Priority').should('be.visible');
    cy.contains('High Priority').should('not.exist');
  });

  it('displays correct statistics', () => {
    // Create multiple todos
    cy.get('[data-testid="title-input"]').type('First Todo');
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="title-input"]').type('Second Todo');
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="title-input"]').type('Third Todo');
    cy.get('[data-testid="submit-button"]').click();

    // Complete one
    cy.get('[data-testid="toggle-button"]').first().click();

    // Check statistics
    cy.get('[data-testid="stat-total"]').should('contain', '3');
    cy.get('[data-testid="stat-active"]').should('contain', '2');
    cy.get('[data-testid="stat-completed"]').should('contain', '1');
  });

  it('clears form after submission', () => {
    cy.get('[data-testid="title-input"]').type('Test Todo');
    cy.get('[data-testid="description-input"]').type('Test Description');
    cy.get('[data-testid="priority-select"]').select('high');
    cy.get('[data-testid="submit-button"]').click();

    // Form should be cleared
    cy.get('[data-testid="title-input"]').should('have.value', '');
    cy.get('[data-testid="description-input"]').should('have.value', '');
    cy.get('[data-testid="priority-select"]').should('have.value', 'medium');
  });

  it('handles complete user workflow', () => {
    // 1. Create a todo
    cy.get('[data-testid="title-input"]').type('Complete Workflow Test');
    cy.get('[data-testid="description-input"]').type('Testing complete flow');
    cy.get('[data-testid="priority-select"]').select('high');
    cy.get('[data-testid="submit-button"]').click();

    // 2. Verify it appears
    cy.contains('Complete Workflow Test').should('be.visible');

    // 3. Complete it
    cy.get('[data-testid="toggle-button"]').click();
    cy.get('[data-testid="todo-status"]').should('contain', '✓ Completed');

    // 4. Filter to see only completed
    cy.get('[data-testid="status-filter"]').select('completed');
    cy.contains('Complete Workflow Test').should('be.visible');

    // 5. Uncomplete it
    cy.get('[data-testid="toggle-button"]').click();

    // 6. Verify it disappears from completed filter
    cy.contains('Complete Workflow Test').should('not.exist');

    // 7. Switch to active filter
    cy.get('[data-testid="status-filter"]').select('active');
    cy.contains('Complete Workflow Test').should('be.visible');

    // 8. Delete it
    cy.get('[data-testid="delete-button"]').click();
    cy.contains('Complete Workflow Test').should('not.exist');
  });
});