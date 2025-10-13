const CallDirection = require("../models/CallDirection.js");

exports.list = async (req, res) => {
  try {
    const items = await CallDirection.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await CallDirection.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "CallDirection not found" });
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
      items = await CallDirection.bulkCreate(payload, { validate: true });
    } else {
      items = await CallDirection.create(payload);
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
    const item = await CallDirection.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "CallDirection not found" });
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
    const item = await CallDirection.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "CallDirection not found" });
    }

    await item.destroy();
    res.json({ status: "true", message: "CallDirection deleted successfully" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};