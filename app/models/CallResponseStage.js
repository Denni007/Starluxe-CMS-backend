// app/models/CallResponseStage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const CallResponseStage = sequelize.define("CallResponseStage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "call_response_stages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = CallResponseStage;