const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Recipe = sequelize.define('Recipe', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    line: { type: DataTypes.STRING },
    business_id: { type: DataTypes.INTEGER, allowNull: false },
    total_usage: { type: DataTypes.FLOAT },
    total_amount: { type: DataTypes.FLOAT },
    per_kg_value: { type: DataTypes.FLOAT },
    production_cost: { type: DataTypes.FLOAT, defaultValue: 0 }, // New Field
    final_value: { type: DataTypes.FLOAT },
    items: { type: DataTypes.JSON },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER }
}, {
    tableName: 'recipes',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Recipe;
