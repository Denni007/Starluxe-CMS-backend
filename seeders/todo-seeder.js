
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('todos', [
      {
        title: 'Complete user authentication',
        description: 'Implement JWT-based authentication for all user roles.',
        status: 'in-progress',
        dueDate: new Date('2024-06-15'),
        reminder: true,
        approved: false,
        assigneeId: 2, // Assuming a user with ID 2 exists
        branchId: 1, // Assuming a branch with ID 1 exists
        created_by: 1, // Assuming a user with ID 1 exists
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Develop dashboard analytics',
        description: 'Create and display key metrics on the admin dashboard.',
        status: 'pending',
        dueDate: new Date('2024-06-20'),
        reminder: true,
        approved: false,
        assigneeId: 2, // Assuming a user with ID 2 exists
        branchId: 1, // Assuming a branch with ID 1 exists
        created_by: 1, // Assuming a user with ID 1 exists
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Fix critical bug in payment gateway',
        description: 'Users are reporting failed transactions.',
        status: 'completed',
        dueDate: new Date('2024-05-28'),
        reminder: false,
        approved: true,
        approved_by: 1,
        assigneeId: 2, // Assuming a user with ID 2 exists
        branchId: 1, // Assuming a branch with ID 1 exists
        created_by: 1, // Assuming a user with ID 1 exists
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('todos', null, {});
  }
};
