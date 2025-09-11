// app/models/LeadSource.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const LeadSource = sequelize.define("LeadSource", {
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
    allowNull: true,
  },
}, {
  tableName: "lead_sources",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = LeadSource;
