// app/models/Task.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    task_name: { type: DataTypes.STRING, allowNull: false },
    task_stage_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    priority: { type: DataTypes.STRING, allowNull: false },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return tomorrow;
        },
    },
    follow_up_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return tomorrow;
        },
    },
    reminder_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    assigned_user: { type: DataTypes.INTEGER, allowNull: true },
    lead_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Task;