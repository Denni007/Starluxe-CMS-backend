const ProformaInvoice = require("../models/ProformaInvoice");
const User = require("../models/user.js");

exports.createProforma = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const data = {
            ...req.body,
            invoice_no: req.body.invoiceNo, // Mapping camelCase to snake_case
            business_name: req.body.businessName,
            state_code: req.body.stateCode,
            total_amount: req.body.totalAmount,
            total_amount_in_words: req.body.totalAmountInWords,
            bank_name: req.body.bankName,
            account_no: req.body.accountNo,
            ifsc_code: req.body.ifscCode,
            branch_name: req.body.branchName,
            branch_id: req.body.branchId,
            created_by: userId,
            updated_by: userId
        };

        const result = await ProformaInvoice.create(data);
        return res.status(200).json({ status: "true", message: "Proforma Invoice created", data: result });
    } catch (error) {
        return res.status(500).json({ status: "false", message: error.message });
    }
};

exports.updateProforma = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        
        // Prepare update data, mapping fields if they exist in req.body
        const updateData = { ...req.body, updated_by: userId };
        if (req.body.businessName) updateData.business_name = req.body.businessName;
        if (req.body.totalAmount) updateData.total_amount = req.body.totalAmount;

        const [updated] = await ProformaInvoice.update(updateData, { where: { id } });

        if (updated) {
            const updatedInvoice = await ProformaInvoice.findByPk(id);
            return res.status(200).json({ status: "true", message: "Updated successfully", data: updatedInvoice });
        }
        throw new Error("Invoice not found");
    } catch (error) {
        return res.status(400).json({ status: "false", message: error.message });
    }
};

exports.getProformas = async (req, res) => {
    try {
        const { branch_id } = req.context || req.query;
        const isAdmin = req.user.isAdmin === true;

        const where = {};
        if (branch_id) {
            where.branch_id = branch_id;
        }

        // Apply your condition: Admins see all, others see only theirs
        if (!isAdmin) {
            where.created_by = req.user.id;
        }

        const items = await ProformaInvoice.findAll({
            where,
            // Include the User model to get creator/updater details
            include: [
                {
                    model: User,
                    as: 'creator', // Ensure this alias matches your model association
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ],
            order: [["id", "DESC"]],
        });

        const mappedData = items.map(inv => ({
            id: inv.id,
            invoiceNo: inv.invoice_no,
            date: inv.date,
            name: inv.name,
            businessName: inv.business_name,
            address: inv.address,
            gstin: inv.gstin,
            items: inv.items,
            totalAmount: inv.total_amount,
            branchId: inv.branch_id,
            createdAt: inv.created_at,
            updatedAt: inv.updated_at,
            // Detailed User Information
            createdByDetail: inv.creator ? `${inv.creator.first_name} ${inv.creator.last_name}` : 'Unknown',
            updatedByDetail: inv.updater ? `${inv.updater.first_name} ${inv.updater.last_name}` : 'Unknown'
        }));

        res.json({ status: "true", data: mappedData });
    } catch (e) {
        console.error("Proforma getProformas error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.getProformaById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await ProformaInvoice.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
                { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ status: "false", message: "Invoice not found" });
        }

        // Map database fields to API specification
        const data = {
            id: invoice.id,
            invoiceNo: invoice.invoice_no,
            date: invoice.date,
            name: invoice.name,
            businessName: invoice.business_name,
            address: invoice.address,
            gstin: invoice.gstin,
            state: invoice.state,
            stateCode: invoice.state_code,
            items: invoice.items,
            totalAmount: invoice.total_amount,
            totalAmountInWords: invoice.total_amount_in_words,
            bankName: invoice.bank_name,
            accountNo: invoice.account_no,
            ifscCode: invoice.ifsc_code,
            branchName: invoice.branch_name,
            branchId: invoice.branch_id,
            updatedByDetail: invoice.updater ? `${invoice.updater.first_name} ${invoice.updater.last_name}` : 'Unknown'
        };

        res.json({ status: "true", data });
    } catch (e) {
        res.status(500).json({ status: "false", message: e.message });
    }
};

// 2. Edit/Update Proforma Invoice
exports.updateProforma = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;

        const updateData = {
            invoice_no: req.body.invoiceNo,
            date: req.body.date,
            name: req.body.name,
            business_name: req.body.businessName,
            address: req.body.address,
            gstin: req.body.gstin,
            state: req.body.state,
            state_code: req.body.stateCode,
            items: req.body.items,
            total_amount: req.body.totalAmount,
            total_amount_in_words: req.body.totalAmountInWords,
            bank_name: req.body.bankName,
            account_no: req.body.accountNo,
            ifsc_code: req.body.ifscCode,
            branch_name: req.body.branchName,
            branch_id: req.body.branchId,
            updated_by: userId
        };

        // Remove undefined keys so we don't overwrite with nulls
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const [updated] = await ProformaInvoice.update(updateData, { where: { id } });

        if (updated) {
            return res.json({ status: "true", message: "Proforma Invoice updated successfully" });
        }
        res.status(404).json({ status: "false", message: "Invoice not found" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

// 3. Delete Proforma Invoice
exports.deleteProforma = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProformaInvoice.destroy({ where: { id } });

        if (deleted) {
            return res.json({ status: "true", message: "Proforma Invoice deleted successfully" });
        }
        res.status(404).json({ status: "false", message: "Invoice not found" });
    } catch (e) {
        res.status(500).json({ status: "false", message: e.message });
    }
};
