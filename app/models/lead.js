// app/models/Lead.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Lead = sequelize.define("Lead", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    lead_name: { type: DataTypes.STRING, allowNull: false },
    lead_stage_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    lead_source_id: { type: DataTypes.INTEGER, allowNull: false },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    contact_number: { type: DataTypes.JSON, allowNull: false },
    email: { type: DataTypes.JSON, allowNull: true },
    tags: { type: DataTypes.JSON, allowNull: true },

    customer_type_id: { type: DataTypes.INTEGER, allowNull: false },
    lead_type_id:  { type: DataTypes.INTEGER, allowNull: false },
    remark: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    assigned_user: { type: DataTypes.INTEGER, allowNull: true },

    // Lead details
    business_name: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    alias: { type: DataTypes.STRING, allowNull: true },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    // Dates
    dates: { type: DataTypes.JSON, allowNull: true },

    // Address
    address_1: { type: DataTypes.STRING, allowNull: true },
    landmark: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "leads",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Lead;
