// app/models/LeadStage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const LeadStage = sequelize.define("LeadStage", {
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
  tableName: "lead_stages",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = LeadStage;
