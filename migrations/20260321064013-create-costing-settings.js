'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CostingSettings', {
      lineId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      resinRate: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      brassRate: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      profitMargin: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      multiplier: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      starMargin: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      goldMargin: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      silverMargin: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CostingSettings');
  }
};
