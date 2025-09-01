// models/Role.js
import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Branch from "./branchModel.js";
import User from "./userModel.js";

const Role = sequelize.define(
  "Role",
  {
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
      allowNull: true 
    },

    created_by: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    updated_by: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Branch,
        key: "id",
      },
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


Role.belongsTo(Branch, { foreignKey: "branch_id", onDelete: "CASCADE" });
Branch.hasMany(Role, { foreignKey: "branch_id" });

Role.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Role.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

export default Role;
