// models/Business.js
import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Role from "./roleModel.js";
import Branch from "./branchModel.js";

const Business = sequelize.define(
  "Business",
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
    
    pan_number: { type: DataTypes.STRING, allowNull: true },
    gstin: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: { msg: "Invalid email format" } },
    },
    contact_number: { type: DataTypes.STRING, allowNull: false },
    industry_id: { type: DataTypes.INTEGER, allowNull: false },
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
  },
  {
    tableName: "businesses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Branch.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Branch.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

export default Business;
