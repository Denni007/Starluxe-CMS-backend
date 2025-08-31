import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Industry = sequelize.define("Industry", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "industries",
  timestamps: true, // will auto create createdAt & updatedAt
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default Industry;
