// app/controller/lead.controller.js
const Lead = require("../models/lead.js");
const User = require("../models/user.js");
const LeadStage = require("../models/leadStage.js");
const LeadSource = require("../models/leadSource.js");
const LeadType = require("../models/leadType.js");
const CustomerType = require("../models/customerType.js");
const Products = require("../models/product.js");
const LeadActivityLog = require("../models/leadActivityLog.js"); // Assumed import

// Helper function to safely get a string/JSON value for logging
const getLogValue = (val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
};

function mapLeadPayload(leadInstance) {
    const obj = leadInstance.toJSON();

    if (obj.assignee) {
        obj.assigned_user = { id: obj.assignee.id, user_name: obj.assignee.user_name, email: obj.assignee.email, first_name: obj.assignee.first_name, last_name: obj.assignee.last_name };
    }
    delete obj.assignee;

    if (obj.stage) { obj.lead_stage_id = { id: obj.stage.id, name: obj.stage.name, color: obj.stage?.color }; } else { }
    delete obj.stage;

    if (obj.source) { obj.lead_source_id = { id: obj.source.id, name: obj.source.name }; }
    delete obj.source;

    if (obj.type) { obj.lead_type_id = { id: obj.type.id, name: obj.type.name, color: obj.type?.color }; } else { }
    delete obj.type;

    if (obj.customerType) { obj.customer_type_id = { id: obj.customerType.id, name: obj.customerType.name }; } else { }
    delete obj.customerType;

    if (obj.products) { obj.product_id = { id: obj.products.id, name: obj.products.name, category: obj.products.category, price: obj.products.price }; } else { }
    delete obj.products;

    return obj;
}

const leadAttributes = { };

exports.list = async (req, res) => {
    try {
        const isAdmin = req.user?.is_admin
        const whereClause = {};

        // If the user is NOT an admin, add the isDelete condition
        if (!isAdmin) {
            whereClause.isDelete = false;
        }

        // Now, execute the query with the dynamically built where clause
        const items = await Lead.findAll({
            attributes: leadAttributes,
            order: [["id", "DESC"]],
            where: whereClause,
        });

        if (!items) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = (items || []).map(mapLeadPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Lead list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Lead.findByPk(req.params.id, {
            attributes: leadAttributes,
            where: { isDelete: false },
            include: [
                { model: User, as: "assignee" },
                { model: LeadStage, as: "stage" },
                { model: LeadSource, as: "source" },
                { model: LeadType, as: "type" },
                { model: CustomerType, as: "customerType" },
                { model: Products, as: "products" },
                { model: LeadActivityLog, as: "activities", attributes: ["id", "user_id", "branch_id", "field_name", "summary", "created_at"] },
            ],
            order: [[{ model: LeadActivityLog, as: 'activities' }, 'created_at', 'DESC']],
        });

        if (!item) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = mapLeadPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Lead getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.listByBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.is_admin
        const whereClause = {};
        // If the user is NOT an admin, add the isDelete condition
        if (!isAdmin) {
            whereClause.branch_id= id
            // whereClause.isDelete = false;
        }
        else{
            whereClause.branch_id= id
            // whereClause.isDelete = false;
        }
        // Now, execute the query with the dynamically built where clause
        
        const items = await Lead.findAll({
            attributes: leadAttributes,
            where: whereClause,
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email", "first_name", "last_name"] },
                { model: LeadStage, as: "stage", attributes: ["id", "name", "color"] },
                { model: LeadSource, as: "source", attributes: ["id", "name"] },
                { model: LeadType, as: "type", attributes: ["id", "name", "color"] },
                { model: CustomerType, as: "customerType", attributes: ["id", "name"] },
                { model: Products, as: "products", attributes: ["id", "name", "price"] },

            ],
        });
        const mapped = (items || []).map(mapLeadPayload);
        // console.log(mapped)

        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Lead listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.listByUser = async (req, res) => {
    try {
        const { id } = req.params;

        const items = await Lead.findAll({
            attributes: leadAttributes,
            where: { assigned_user: id, isDelete: false },
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email", "first_name", "last_name"] },
                { model: LeadStage, as: "stage", attributes: ["id", "name", "color"] },
                { model: LeadSource, as: "source", attributes: ["id", "name"] },
                { model: LeadType, as: "type", attributes: ["id", "name", "color"] },
                { model: CustomerType, as: "customerType", attributes: ["id", "name"] },
                { model: Products, as: "products", attributes: ["id", "name", "category", "price"] }
            ],
        });

        const mapped = (items || []).map(mapLeadPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Lead listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        const {
            lead_name, lead_stage_id, lead_source_id, branch_id, contact_number, email,
            lead_type_id, remark, description, assigned_user, customer_type_id, tags,
            business_name, website, location, alias, product_id, amount,
            dates, address_1, landmark, city, state, country, pincode,
        } = req.body;

        if (!lead_name || !lead_source_id || !branch_id || !contact_number || !dates) {
            return res.status(400).json({ status: "false", message: "lead_name, lead_source_id, branch_id, contact_number, dates are required" });
        }
        if (!Array.isArray(contact_number) || contact_number.length === 0) {
            return res.status(400).json({ status: "false", message: "contact_number must be a non-empty array" });
        }
        if (email && !Array.isArray(email)) {
            return res.status(400).json({ status: "false", message: "email must be an array if provided" });
        }
        if (typeof dates !== "object" || Array.isArray(dates)) {
            return res.status(400).json({ status: "false", message: "dates must be an object" });
        }

        const lead = await Lead.create({
            lead_name, lead_stage_id: typeof lead_stage_id === "number" ? lead_stage_id : undefined, lead_source_id, branch_id, contact_number,
            email: email || null, lead_type_id: lead_type_id || null, customer_type_id: customer_type_id || null, tags: tags || null,
            remark: remark || null, description: description || null, assigned_user: assigned_user || null,
            business_name: business_name || null, website: website || null, location: location || null, alias: alias || null,
            product_id: product_id || null, amount: amount || null, dates,
            address_1: address_1 || null, landmark: landmark || null, city: city || null, state: state || null, country: country || null,
            pincode: pincode || null, created_by: userId, updated_by: userId,
        });

        // Log the creation event
        const creationSummary = [`Lead **${lead.lead_name}** created`];

        await LeadActivityLog.create({
            lead_id: lead.id,
            user_id: userId,
            branch_id: lead.branch_id,
            field_name: 'Creation',
            old_value: null, new_value: null,
            summary: JSON.stringify(creationSummary),
        });

        const finalLead = lead.toJSON();
        delete finalLead.isDelete;

        res.status(201).json({ status: "true", data: finalLead });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patch = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const lead = await Lead.findByPk(req.params.id);
        if (!lead) return res.status(404).json({ status: "false", message: "Lead not found" });

        const up = {};
        const changeDescriptions = [];

        const fieldsToCheck = [
            "lead_name", "lead_stage_id", "lead_source_id", "branch_id",
            "lead_type_id", "customer_type_id", "product_id",
            "remark", "description", "assigned_user",
            "tags",
            "business_name", "website", "location", "alias",
            "amount",
            "address_1", "landmark", "city", "state", "country", "pincode",
            "contact_number", "email", "dates",
        ];

        fieldsToCheck.forEach(k => {
            if (typeof req.body[k] !== "undefined") {

                if (k === 'contact_number' && (!Array.isArray(req.body[k]) || req.body[k].length === 0)) {
                    return res.status(400).json({ status: "false", message: "contact_number must be a non-empty array" });
                }
                if (k === 'email' && req.body[k] !== null && !Array.isArray(req.body[k])) {
                    return res.status(400).json({ status: "false", message: "email must be an array or null" });
                }
                if (k === 'dates' && req.body[k] !== null && (typeof req.body[k] !== "object" || Array.isArray(req.body[k]))) {
                    return res.status(400).json({ status: "false", message: "dates must be an object or null" });
                }
                if (k === 'tags' && req.body[k] !== null && !Array.isArray(req.body[k])) {
                    return res.status(400).json({ status: "false", message: "tags must be an array or null" });
                }

                up[k] = req.body[k];

                const oldValue = lead.get(k);
                const newValue = req.body[k];

                const oldLogValue = getLogValue(oldValue);
                const newLogValue = getLogValue(newValue);

                if (oldLogValue !== newLogValue) {
                    let description = '';
                    const fieldName = k.replace(/_/g, ' ');

                    if (oldLogValue === null || oldLogValue === 'null') {
                        description = `Added **${fieldName}** as *${newLogValue}*`;
                    } else if (newLogValue === null || newLogValue === 'null') {
                        description = `Removed **${fieldName}** (was *${oldLogValue}*)`;
                    } else {
                        description = `Updated **${fieldName}** from *${oldLogValue}* to *${newLogValue}*`;
                    }

                    changeDescriptions.push({ key: k, text: description });
                }
            }
        });

        up.updated_by = userId;

        await lead.update(up);

        if (changeDescriptions.length > 0) {

            let logFieldName;

            if (changeDescriptions.length === 1) {
                const singleKey = changeDescriptions[0].key;
                const fieldName = singleKey.replace(/_/g, ' ');
                logFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' Updated';
            } else {
                logFieldName = 'Multiple Fields Updated';
            }

            const summaryTexts = changeDescriptions.map(d => d.text);
            const summaryData = JSON.stringify(summaryTexts);

            await LeadActivityLog.create({
                lead_id: lead.id,
                user_id: userId,
                branch_id: lead.branch_id,
                field_name: logFieldName,
                old_value: null, new_value: null,
                summary: summaryData,
            });
        }

        const finalLead = lead.toJSON();
        delete finalLead.isDelete;

        res.json({ status: "true", data: finalLead });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const lead = await Lead.findByPk(req.params.id);

        if (!lead) {
            return res.status(404).json({ status: "false", message: "Lead not found" });
        }

        if (lead.isDelete) {
            return res.status(400).json({ status: "false", message: "Lead already deleted" });
        }

        const leadId = lead.id;
        const leadName = lead.lead_name;
        const branchId = lead.branch_id;

        try {
            // Attempt soft delete
            await lead.update({ isDelete: true });

            const deletionSummary = [`Lead **${leadName}** deleted`];

            await LeadActivityLog.create({
                lead_id: leadId,
                user_id: userId,
                branch_id: branchId,
                field_name: 'Deletion',
                old_value: null,
                new_value: null,
                summary: JSON.stringify(deletionSummary),
            });

            return res.json({ status: "true", message: "Lead deleted" });

        } catch (dbError) {
            if (
                dbError.name === 'SequelizeForeignKeyConstraintError' ||
                (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451))
            ) {
                const message = "Cannot delete this Lead because it is currently linked to other records. Please update or delete those records first.";

                return res.status(409).json({
                    status: "false",
                    message: message,
                    error_type: "ForeignKeyConstraintError"
                });
            }

            throw dbError;
        }

    } catch (e) {
        console.error("Lead remove error:", e.message);
        res.status(400).json({ status: "false", message: e.message });
    }
};