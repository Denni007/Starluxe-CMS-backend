const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Business = sequelize.define("Business", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  pan_number: { type: DataTypes.STRING, allowNull: true },
  gstin: { type: DataTypes.STRING, allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
  contact_number: { type: DataTypes.STRING, allowNull: false },
  industry_id: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "businesses",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Business;
