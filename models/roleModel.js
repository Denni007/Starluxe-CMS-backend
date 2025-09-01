import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },

  branch_id: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "roles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default Role;
