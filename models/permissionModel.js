// models/Permission.js
import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

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

export default Permission;
