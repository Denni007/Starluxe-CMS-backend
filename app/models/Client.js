// app/models/Client.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Client = sequelize.define("Client", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    anniversary_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    special_dates: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_description: {
        type: DataTypes.TEXT,
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
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Client;
