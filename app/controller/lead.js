// app/controller/lead.controller.js
const Lead = require("../models/lead.js");
const User = require("../models/user.js");
const LeadStage = require("../models/LeadStage.js");
const LeadSource = require("../models/LeadSource.js");
const LeadType = require("../models/LeadType.js");
const CustomerType = require("../models/CustomerType.js");
const Products = require("../models/product.js");
const LeadActivityLog = require("../models/LeadActivityLog.js");

const getLogValue = (val) => {
  if (val === null || val === undefined) return null;
  return typeof val === 'object' ? JSON.stringify(val) : String(val);
};

function mapLeadPayload(leadInstance) {
  // toJSON to get plain object
  const obj = leadInstance.toJSON();

  // map assignee -> assigned_user
  if (obj.assignee) {
    obj.assigned_user = {
      id: obj.assignee.id,
      user_name: obj.assignee.user_name,
      email: obj.assignee.email,
      first_name: obj.assignee.first_name,
      last_name: obj.assignee.last_name,
    };
  } else {
    // leave assigned_user as-is (scalar) if no relation loaded/found
    // obj.assigned_user remains whatever value was in DB (number or null)
  }
  delete obj.assignee;

  // map stage -> lead_stage_id
  if (obj.stage) {
    obj.lead_stage_id = {
      id: obj.stage.id,
      name: obj.stage.name,
    };
  } else {
    // keep existing scalar lead_stage_id if no relation
  }
  delete obj.stage;

  // map source -> lead_source_id
  if (obj.source) {
    obj.lead_source_id = {
      id: obj.source.id,
      name: obj.source.name,
    };
  } else {
    // keep scalar value
  }
  delete obj.source;

  if (obj.type) {
    obj.lead_type_id = {
      id: obj.type.id,
      name: obj.type.name
    };
  }
  else {
    // keep scalar value
  }
  if (obj.customerType) {
    obj.customer_type_id = {
      id: obj.customerType.id,
      name: obj.customerType.name
    };
  }
  else {
    // keep scalar value
  }
  if (obj.products) {
    obj.product_id = {
      id: obj.products.id,
      name: obj.products.name,
      category: obj.products.category,
      price: obj.products.price
    };
  }
  else {
    // keep scalar valueg
  }
  return obj;
}

exports.list = async (req, res) => {
  try {
    const items = await Lead.findAll({
      order: [["id", "DESC"]],
    });

    if (!items) return res.status(404).json({ status: "false", message: "Not found" });

    res.json({ status: "true", data: items });
  } catch (e) {
    console.error("Lead list error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "assignee",
        },
        {
          model: LeadStage,
          as: "stage",
        },
        {
          model: LeadSource,
          as: "source",
        },
        {
          model: LeadType,
          as: "type",
        },
        {
          model: CustomerType,
          as: "customerType",
        },
        {
          model: Products,
          as: "products",
        }
      ],
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
    const items = await Lead.findAll({
      where: { branch_id: id },
      order: [["id", "DESC"]],
      include: [
        { model: User, as: "assignee", attributes: ["id", "user_name", "email", "first_name", "last_name"] },
        { model: LeadStage, as: "stage", attributes: ["id", "name"] },
        { model: LeadSource, as: "source", attributes: ["id", "name"] },
        { model: LeadType, as: "type", attributes: ["id", "name"] },
        { model: CustomerType, as: "customerType", attributes: ["id", "name"] },
        { model: Products, as: "products", attributes: ["id", "name", "category", "price"] },

      ],
    });

    // items is an array — map each element
    const mapped = (items || []).map(mapLeadPayload);
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
      where: { assigned_user: id },
      order: [["id", "DESC"]],
      include: [
        { model: User, as: "assignee", attributes: ["id", "user_name", "email", "first_name", "last_name"] },
        { model: LeadStage, as: "stage", attributes: ["id", "name"] },
        { model: LeadSource, as: "source", attributes: ["id", "name"] },
        { model: LeadType, as: "type", attributes: ["id", "name"] },
        { model: CustomerType, as: "customerType", attributes: ["id", "name"] },
        { model: Products, as: "products", attributes: ["id", "name", "category", "price"] }
      ],
    });

    // items is an array — map each element
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
      lead_name,
      lead_stage_id,
      lead_source_id,
      branch_id,
      contact_number,
      email,
      lead_type_id,
      remark,
      description,
      assigned_user,
      customer_type_id,
      tags,
      business_name,
      website,
      location,
      alias,
      product_name,
      product_id,
      amount,
      dates,
      address_1,
      landmark,
      city,
      state,
      country,
      pincode,
    } = req.body; // Destructuring is already complete here

    // Minimal validations (align with your schema)
    if (!lead_name || !lead_source_id || !branch_id || !contact_number || !dates) {
      return res.status(400).json({
        status: "false",
        message: "lead_name, lead_source_id, branch_id, contact_number, dates are required",
      });
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
      lead_name,
      lead_stage_id: typeof lead_stage_id === "number" ? lead_stage_id : undefined,
      lead_source_id,
      branch_id,
      contact_number,
      email: email || null,
      lead_type_id: lead_type_id || null, // Field handled
      customer_type_id: customer_type_id || null, // Field handled
      tags: tags || null,
      remark: remark || null,
      description: description || null,
      assigned_user: assigned_user || null,
      business_name: business_name || null,
      website: website || null,
      location: location || null, // Field handled
      alias: alias || null,
      product_name: product_name || null, // Field handled
      product_id: product_id || null, // Field handled
      amount: amount || null, // Field handled
      dates,
      address_1: address_1 || null,
      landmark: landmark || null,
      city: city || null,
      state: state || null,
      country: country || null,
      pincode: pincode || null,
      created_by: userId,
      updated_by: userId,
    });

    // ⬅️ UPDATED: Log the creation event as a JSON array containing one string
    const creationSummary = [`Lead **${lead.lead_name}** created`];

    await LeadActivityLog.create({
      lead_id: lead.id,
      user_id: userId,
      branch_id: lead.branch_id,
      field_name: 'Creation',
      old_value: null,
      new_value: null,
      summary: JSON.stringify(creationSummary),
    });

    res.status(201).json({ status: "true", data: lead });
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

    // ⬅️ CRITICAL FIX: Ensure ALL fields from the model that need tracking are listed here.
    const fieldsToCheck = [
      "lead_name", "lead_stage_id", "lead_source_id", "branch_id",
      "lead_type_id", "customer_type_id", "product_id", // ADDED: ID fields
      "remark", "description", "assigned_user",
      "tags",
      "business_name", "website", "location", "alias", "product_name", // ADDED: Lead details
      "amount", // ADDED: Amount field
      "address_1", "landmark", "city", "state", "country", "pincode",
      "contact_number", "email", "dates", // JSON fields
    ];

    // --- 1. Build the 'up' object and generate summary descriptions ---
    fieldsToCheck.forEach(k => {
      if (typeof req.body[k] !== "undefined") {

        // Validation and assignment to 'up'
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

        // Check for value change
        const oldValue = lead.get(k);
        const newValue = req.body[k];

        const oldLogValue = getLogValue(oldValue);
        const newLogValue = getLogValue(newValue);

        // ⬅️ LOGIC UPDATED: Log if values are different and add to descriptions
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

          changeDescriptions.push(description);
        }
      }
    });

    up.updated_by = userId;

    // --- 2. Perform the update ---
    await lead.update(up);

    // ⬅️ UPDATED: Log consolidated activity as a JSON array string
    if (changeDescriptions.length > 0) {
      // Stringify the array of text strings for database storage
      const summaryData = JSON.stringify(changeDescriptions);

      await LeadActivityLog.create({
        lead_id: lead.id,
        user_id: userId,
        branch_id: lead.branch_id,
        field_name: 'Multiple Fields Updated',
        old_value: null,
        new_value: null,
        summary: summaryData,
      });
    }

    res.json({ status: "true", data: lead });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id || null; // ⬅️ Get user ID for logging
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ status: "false", message: "Lead not found" });

    const leadId = lead.id;
    const leadName = lead.lead_name;
    const branchId = lead.branch_id; // <-- Stored before destruction

    await lead.destroy();

    // ⬅️ UPDATED: Log the deletion event. Uses the branch_id retrieved before destruction.
    const deletionSummary = [`Lead **${leadName}** deleted`];

    await LeadActivityLog.create({
      lead_id: leadId,
      user_id: userId,
      branch_id: branchId, // <-- ADDED: Use the stored branch_id
      field_name: 'Deletion',
      old_value: null,
      new_value: null,
      summary: JSON.stringify(deletionSummary), // Save as JSON array string
    });

    res.json({ status: "true", message: "Deleted" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};