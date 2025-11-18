// ***********************************************
// Custom commands for Cypress
// ***********************************************

// Command to create a todo via API
Cy.Commands.add('createTodo', (todoData) => {
  return cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/todos',
    body: todoData
  });
});

// Command to delete all todos
Cy.Commands.add('deleteAllTodos', () => {
  return cy.request({
    method: 'GET',
    url: 'http://localhost:5000/api/todos'
  }).then((response) => {
    const todos = response.body.data;
    todos.forEach((todo) => {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/api/todos/${todo._id}`
      });
    });
  });
});

// Command to wait for API response
Cy.Commands.add('waitForTodoAPI', () => {
  cy.intercept('GET', '**/api/todos').as('getTodos');
  cy.wait('@getTodos');
});