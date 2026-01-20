const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  user_name: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },

  email: {
    type: DataTypes.STRING, allowNull: false,
    validate: { isEmail: { msg: "Invalid email format" } },
  },

  mobile_number: {
    type: DataTypes.STRING, allowNull: false,
    validate: { is: { args: /^[0-9]{10}$/, msg: "Mobile number must be exactly 10 digits" } },
  },

  dob: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },

  password: { type: DataTypes.STRING, allowNull: false },

  alias_name: { type: DataTypes.STRING, allowNull: true },
  father_name: { type: DataTypes.STRING, allowNull: true },
  mother_name: { type: DataTypes.STRING, allowNull: true },
  pan: { type: DataTypes.STRING, allowNull: true },
  aadhaar: { type: DataTypes.STRING, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: true },

  is_email_verify: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    {
      unique: true,
      fields: ["user_name"],
      name: "users_user_name_unique",
    },
    {
      unique: true,
      fields: ["email"],
      name: "users_email_unique",
    },
    {
      unique: true,
      fields: ["mobile_number"],
      name: "users_mobile_number_unique",
    },
  ],
});

module.exports = User;
