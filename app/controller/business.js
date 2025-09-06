const Business = require("../models/business");

exports.create = async (req, res) => {
  try {
    const userId = req.user?.id; // comes from auth middleware
    

    if (!userId) {
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    const item = await Business.create({
      ...req.body,
      created_by: userId,
      updated_by: userId,
    });

    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("❌ Business create error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.list = async (req, res) => {
  try {
    const items = await Business.findAll({ order: [["id", "DESC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Business.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Not found" });
    await item.update(req.body);
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const count = await Business.destroy({ where: { id: req.params.id } });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};