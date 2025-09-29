// app/models/LeadActivityLog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const LeadActivityLog = sequelize.define("LeadActivityLog", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    lead_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    field_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "lead_activity_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
});

module.exports = LeadActivityLog;