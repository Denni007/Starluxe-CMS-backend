// models/Branch.js
import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
// import Business from "./businessModel.js";
import User from "./userModel.js";
import Role from "./roleModel.js";
import Business from "./businessModel.js";

const Branch = sequelize.define(
  "Branch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: { msg: "Invalid email format" } },
    },
    contact_number: { type: DataTypes.STRING, allowNull: true },
    type: {
      type: DataTypes.ENUM("OFFICE", "WAREHOUSE", "SHOP"),
      allowNull: false,
      defaultValue: "OFFICE",
    },

    address_1: { type: DataTypes.STRING, allowNull: false },
    address_2: { type: DataTypes.STRING, allowNull: true },
    landmark: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },
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
    tableName: "branches",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Branch.belongsTo(Business, { foreignKey: "business_id" });
Business.hasMany(Branch, { foreignKey: "business_id" });

Branch.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Branch.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

export default Branch;
