// app/models/LeadType.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const CustomerType = sequelize.define("CustomerType", {
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
  tableName: "customer_types",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = CustomerType;
