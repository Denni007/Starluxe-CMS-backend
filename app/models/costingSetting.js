const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const CostingSetting = sequelize.define('CostingSetting', {
    lineId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    business_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    resinRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    brassRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    profitMargin: { type: DataTypes.FLOAT, defaultValue: 0 },
    multiplier: { type: DataTypes.FLOAT, defaultValue: 0 },
    starMargin: { type: DataTypes.FLOAT, defaultValue: 0 },
    goldMargin: { type: DataTypes.FLOAT, defaultValue: 0 },
    silverMargin: { type: DataTypes.FLOAT, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "costing_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = CostingSetting;
