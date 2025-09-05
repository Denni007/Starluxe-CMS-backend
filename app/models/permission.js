// models/Permission.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  module: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "permissions",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["module", "action"] } // 👈 important
  ]
});

module.exports = Permission;
