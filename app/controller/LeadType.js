// app/controller/LeadType.controller.js
const LeadType = require("../models/LeadType.js");


exports.list = async (req, res) => {
  try {
    const items = await LeadType.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await LeadType.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadType not found" });
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
      items = await LeadType.bulkCreate(payload, { validate: true });
    } else {
      items = await LeadType.create(payload);
    }

    res.status(200).json({ status: "true", data: items });
  } catch (e) {
    console.error("❌ Error creating industries:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { name,description,color} = req.body;
    const item = await LeadType.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadType not found" });
    }

    item.name = name || item.name;
    item.color = color || item.color;
    item.description = description || item.description; 
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const item = await LeadType.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadType not found" });
    }

    await item.destroy();
    res.json({ status: "true", message: "LeadType deleted successfully" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
