
// app/models/CallDirection.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const CallDirection = sequelize.define("CallDirection", {
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
    tableName: "call_directions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = CallDirection;