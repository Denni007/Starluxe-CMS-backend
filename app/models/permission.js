// app/models/Permission.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const ALLOWED_ACTIONS = ["create", "update", "delete", "view","access"];

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

 
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  action: {
    type: DataTypes.ENUM(...ALLOWED_ACTIONS),
    allowNull: false,
  },
  
}, {
  tableName: "permissions",
  timestamps: false,
});

module.exports = Permission;


