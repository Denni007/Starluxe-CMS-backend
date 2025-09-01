import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Invalid email format" },
      },
    },

    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[0-9]{10}$/,
          msg: "Mobile number must be exactly 10 digits",
        },
      },
    },

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Optional fields (can be updated later)
    alias_name: { type: DataTypes.STRING, allowNull: true },
    father_name: { type: DataTypes.STRING, allowNull: true },
    mother_name: { type: DataTypes.STRING, allowNull: true },
    pan: { type: DataTypes.STRING, allowNull: true },
    aadhaar: { type: DataTypes.STRING, allowNull: true },
    driving_license: { type: DataTypes.STRING, allowNull: true },
    image_url: { type: DataTypes.STRING, allowNull: true },

    is_email_verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
