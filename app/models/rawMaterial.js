const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const RawMaterial = sequelize.define('RawMaterial', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    rate_per_kg: { type: DataTypes.FLOAT, defaultValue: 0 },
    business_id: { type: DataTypes.INTEGER, allowNull: false },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER }
}, {
    tableName: 'raw_materials',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = RawMaterial;
