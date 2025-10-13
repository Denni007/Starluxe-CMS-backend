// app/models/Call.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Call = sequelize.define("Call", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subject: { type: DataTypes.STRING, allowNull: false },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    call_direction_id: { type: DataTypes.INTEGER, allowNull: true },
    call_response: { type: DataTypes.BOOLEAN, allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    summary: { type: DataTypes.TEXT, allowNull: true },
    call_type: { type: DataTypes.STRING, allowNull: false },  //Log,Schedule,Reschedule,Cancelled
    lead_id: { type: DataTypes.INTEGER, allowNull: true },
    task_id: { type: DataTypes.INTEGER, allowNull: true },
    reminder_id: { type: DataTypes.INTEGER, allowNull: true },
    contact_number: { type: DataTypes.STRING, allowNull: true },
    assigned_user: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: "calls",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Call;
