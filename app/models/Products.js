// app/models/LeadType.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Products = sequelize.define("Products", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  price: {
    type: DataTypes.NUMBER,
    allowNull: false, 
  },

  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "products",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Products;
