// app/controller/lead.controller.js
const Lead = require("../models/lead.js");
const User = require("../models/user.js");
const LeadStage = require("../models/LeadStage.js");
const LeadSource = require("../models/LeadSource.js");

function mapLeadPayload(leadInstance) {
  // toJSON to get plain object
  const obj = leadInstance.toJSON();

  // map assignee -> assigned_user
  if (obj.assignee) {
    obj.assigned_user = {
      id: obj.assignee.id,
      user_name: obj.assignee.user_name,
      email: obj.assignee.email,
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

  return obj;
}

// List all leads, include relations, return mapped payload
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

// Get single lead by id with same mapping
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
        { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
        { model: LeadStage, as: "stage", attributes: ["id", "name"] },
        { model: LeadSource, as: "source", attributes: ["id", "name"] },
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
        { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
        { model: LeadStage, as: "stage", attributes: ["id", "name"] },
        { model: LeadSource, as: "source", attributes: ["id", "name"] },
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

// POST /leads  (create)
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
    } = req.body;

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
      lead_stage_id: typeof lead_stage_id === "number" ? lead_stage_id : undefined, // let default apply if undefined
      lead_source_id,
      branch_id,
      contact_number,
      email: email || null,
      lead_type_id: lead_type_id || null,
      customer_type_id: customer_type_id || null,
      tags: tags || null, 
      remark: remark || null,
      description: description || null,
      assigned_user: assigned_user || null,
      business_name: business_name || null,
      website: website || null,
      location: location || null,
      alias: alias || null,
      product_name: product_name || null,
      product_id: product_id || null,
      amount: amount || null,
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

    res.status(201).json({ status: "true", data: lead });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

// PATCH /leads/:id  (partial update)
exports.patch = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ status: "false", message: "Lead not found" });

    // Only touch fields included in body (no helpers)
    const up = {};

    // Scalars
    [
      "lead_name","lead_stage_id","lead_source_id","branch_id",
      "lead_type","remark","description","assigned_user",
      "customer_type","tags",
      "business_name","website","location","alias","product_name",
      "amount","address_1","landmark","city","state","country","pincode"
    ].forEach(k => {
      if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
    });

    // JSONs with basic checks
    if (typeof req.body.contact_number !== "undefined") {
      if (!Array.isArray(req.body.contact_number) || req.body.contact_number.length === 0) {
        return res.status(400).json({ status: "false", message: "contact_number must be a non-empty array" });
      }
      up.contact_number = req.body.contact_number;
    }
    if (typeof req.body.email !== "undefined") {
      if (req.body.email !== null && !Array.isArray(req.body.email)) {
        return res.status(400).json({ status: "false", message: "email must be an array or null" });
      }
      up.email = req.body.email;
    }
    if (typeof req.body.dates !== "undefined") {
      if (req.body.dates !== null && (typeof req.body.dates !== "object" || Array.isArray(req.body.dates))) {
        return res.status(400).json({ status: "false", message: "dates must be an object or null" });
      }
      up.dates = req.body.dates;
    }

    up.updated_by = userId;

    await lead.update(up);
    res.json({ status: "true", data: lead });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

// DELETE /leads/:id
exports.remove = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ status: "false", message: "Lead not found" });

    await lead.destroy();
    res.json({ status: "true", message: "Deleted" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
