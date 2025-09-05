// app/controller/industry.controller.js
const Industry = require("../models/industry");

/**
 * GET /industries
 */
exports.list = async (req, res) => {
  try {
    const items = await Industry.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /industries/:id
 */
exports.get = async (req, res) => {
  try {
    const item = await Industry.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "Industry not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /industries
 * Supports single or bulk insert
 */
exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    if (Array.isArray(payload)) {
      items = await Industry.bulkCreate(payload, { validate: true });
    } else {
      items = await Industry.create(payload);
    }

    res.status(201).json({ status: "true", data: items });
  } catch (e) {
    console.error("❌ Error creating industries:", e.message);
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /industries/:id
 */
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const item = await Industry.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Industry not found" });
    }

    item.name = name || item.name;
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /industries/:id
 */
exports.remove = async (req, res) => {
  try {
    const item = await Industry.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Industry not found" });
    }

    await item.destroy();
    res.json({ status: "true", message: "Industry deleted successfully" });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};
