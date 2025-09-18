// app/controller/Products.controller.js
const Products = require("../models/Products.js");


exports.list = async (req, res) => {
  try {
    const items = await Products.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await Products.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.create = async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload);
    let items;

    if (Array.isArray(payload)) {
      items = await Products.bulkCreate(payload, { validate: true });
    } else {
      items = await Products.create(payload);
    }

    res.status(200).json({ status: "true", data: items });
  } catch (e) {
    console.error("❌ Error creating industries:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { name,description,category,price} = req.body;
    const item = await Products.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    item.name = name || item.name;
    item.price = price || item.price;
    item.category = category || item.category;
    item.description = description || item.description; 
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const item = await Products.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    await item.destroy();
    res.json({ status: "true", message: "Products deleted successfully" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
