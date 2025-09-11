// app/controller/LeadStage.controller.js
const LeadStage = require("../models/LeadStage.js");


exports.list = async (req, res) => {
  try {
    const items = await LeadStage.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await LeadStage.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadStage not found" });
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
      items = await LeadStage.bulkCreate(payload, { validate: true });
    } else {
      items = await LeadStage.create(payload);
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
    const item = await LeadStage.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadStage not found" });
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
    const item = await LeadStage.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "LeadStage not found" });
    }

    await item.destroy();
    res.json({ status: "true", message: "LeadStage deleted successfully" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
