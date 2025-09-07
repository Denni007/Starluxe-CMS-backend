// app/models/Permission.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const ALLOWED_ACTIONS = ["create", "update", "delete", "view"];

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

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
  indexes: [
    { unique: true, fields: ["business_id", "module", "action"] },
  ],
});

module.exports = Permission;
