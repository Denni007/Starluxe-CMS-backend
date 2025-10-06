// app/controller/LeadSource.controller.js
const LeadSource = require("../models/LeadSource.js");


exports.list = async (req, res) => {
  try {
    const items = await LeadSource.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await LeadSource.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadSource not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    if (Array.isArray(payload)) {
      items = await LeadSource.bulkCreate(payload, { validate: true });
    } else {
      items = await LeadSource.create(payload);
    }

    res.status(200).json({ status: "true", data: items });
  } catch (e) {
    console.error("❌ Error creating industries:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const item = await LeadSource.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadSource not found" });
    }

    item.name = name || item.name;
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const item = await LeadSource.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadSource not found" });
    }

    try {
      await item.destroy();
      res.json({ status: "true", message: "LeadSource deleted successfully" });
    } catch (dbError) {

      if (dbError.name === 'SequelizeForeignKeyConstraintError' ||
        (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451))) {

        const message = "Cannot delete this Lead Source because it is currently linked to one or more Leads. Please update or delete the linked Leads first.";

        return res.status(409).json({ 
          status: "false",
          message: message,
          error_type: "ForeignKeyConstraintError" 
        });
      }
      throw dbError;
    }

  } catch (e) {
    console.error("LeadSource remove error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};