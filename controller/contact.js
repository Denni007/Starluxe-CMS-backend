const Contact = require("../models/Contact");

exports.create = async (req, res) => {
  try {
    const item = await Contact.create(req.body);
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await Contact.findAll({ order: [["id", "DESC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Contact.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Not found" });
    await item.update(req.body);
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const count = await Contact.destroy({ where: { id: req.params.id } });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};