const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const ProductCategory = sequelize.define("ProductCategory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "product_categories",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = ProductCategory;