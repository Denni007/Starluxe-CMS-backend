// app/controller/permission.controller.js
const Permission = require("../models/permission");

/**
 * GET /permissions
 */
exports.list = async (req, res) => {
  try {
    const items = await Permission.findAll({
      order: [["module", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /permissions
 * Supports single or bulk create
 */
exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    if (Array.isArray(payload)) {
      items = await Permission.bulkCreate(payload, { validate: true });
    } else {
      items = await Permission.create(payload);
    }

    res.status(201).json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};
