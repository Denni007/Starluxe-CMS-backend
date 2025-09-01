import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  module: {
    type: DataTypes.STRING, allowNull: false, // must match one of PERMISSION_MODULES
  },
  action: {
    type: DataTypes.STRING, allowNull: false, // must match one of PERMISSION_ACTIONS
  },
}, {
  tableName: "permissions",
  timestamps: false,
});

export default Permission;
