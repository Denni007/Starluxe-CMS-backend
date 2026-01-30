const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Todo = sequelize.define('Todo', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'closed', 'rejected'),
        defaultValue: 'pending'
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reminder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    assigneeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "todos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Todo;