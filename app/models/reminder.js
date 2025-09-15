// app/models/reminder.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Reminder = sequelize.define("Reminder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reminder_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reminder_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    reminder_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    reminder_unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reminder_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    assigned_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    task_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "reminders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Reminder;