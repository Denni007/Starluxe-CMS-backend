const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Branch = sequelize.define("Branch", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
  contact_number: { type: DataTypes.STRING, allowNull: true },

  type: {
    type: DataTypes.ENUM("OFFICE", "WAREHOUSE", "SHOP"),
    allowNull: false, defaultValue: "OFFICE",
  },

  address_1: { type: DataTypes.STRING, allowNull: false },
  address_2: { type: DataTypes.STRING, allowNull: true },
  landmark:  { type: DataTypes.STRING, allowNull: true },
  city:   { type: DataTypes.STRING, allowNull: false },
  state:  { type: DataTypes.STRING, allowNull: false },
  country:{ type: DataTypes.STRING, allowNull: false },
  pincode:{ type: DataTypes.STRING, allowNull: false },

  business_id: { type: DataTypes.INTEGER, allowNull: false },

  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "branches",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Branch;