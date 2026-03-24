const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const ProformaInvoice = sequelize.define('ProformaInvoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoice_no: { type: DataTypes.STRING, unique: true, allowNull: false },
    date: { type: DataTypes.DATEONLY },
    name: { type: DataTypes.STRING },
    business_name: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    gstin: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    state_code: { type: DataTypes.STRING },
    items: { 
        type: DataTypes.JSON, // Stores the array of objects
        allowNull: false 
    },
    total_amount: { type: DataTypes.FLOAT },
    total_amount_in_words: { type: DataTypes.STRING },
    bank_name: { type: DataTypes.STRING },
    account_no: { type: DataTypes.STRING },
    ifsc_code: { type: DataTypes.STRING },
    branch_name: { type: DataTypes.STRING },
    branch_id: { type: DataTypes.STRING },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER }
}, {
    tableName: 'proforma_invoices',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = ProformaInvoice;
