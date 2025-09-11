// app/controller/lead.controller.js
const Lead = require("../models/lead");

// GET /leads  (no pagination)
exports.list = async (req, res) => {
  try {
    const items = await Lead.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

// GET /leads/:id
exports.getById = async (req, res) => {
  try {
    const item = await Lead.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Lead not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

// POST /leads  (create)
exports.create = async (req, res) => {
    console.log("Creating lead with data:", req.body);
    
  try {
    const userId = req.user?.id || null;

    const {
      lead_name,
      lead_stage_id,      
      lead_source_id,
      branch_id,
      contact_number,     
      email,           
      lead_type,
      remark,
      description,
      assigned_user,
      business_name,
      website,
      location,
      alias,
      product_name,
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
      lead_type: lead_type || null,
      remark: remark || null,
      description: description || null,
      assigned_user: assigned_user || null,
      business_name: business_name || null,
      website: website || null,
      location: location || null,
      alias: alias || null,
      product_name: product_name || null,
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
