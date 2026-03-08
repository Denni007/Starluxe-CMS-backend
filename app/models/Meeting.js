// app/models/Meeting.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Meeting = sequelize.define("Meeting", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    recurrence: {
        type: DataTypes.ENUM('once', 'daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'),
        allowNull: false,
        defaultValue: 'once',
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Stores recurrence rule. 'once': 'YYYY-MM-DD HH:mm', 'daily': 'HH:mm', 'weekly': 'D-HH:mm' (1-7 for Mon-Sun), 'monthly': 'DD-HH:mm', 'quarterly': 'M-DD-HH:mm' (M in 1-3), 'half-yearly': 'M-DD-HH:mm' (M in 1-6), 'yearly': 'MM-DD-HH:mm'"
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    attendees: {
        type: DataTypes.JSON, // Corrected from JSONB to JSON
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "meetings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Meeting;
