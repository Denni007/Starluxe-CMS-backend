const Products = require("../models/product.js");
const ProductCategory = require("../models/ProductCategory.js");

exports.list = async (req, res) => {
  try {
    const items = await Products.findAll({
      order: [["name", "ASC"]],
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }]
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    console.error("Product list error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Products.findByPk(req.params.id, {
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }]
    });
    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    const expectedBusinessId = Number(req.query.business_id);
    if (expectedBusinessId && item.business_id !== expectedBusinessId) {
      return res.status(403).json({ status: "false", message: "Access denied: Product outside specified scope." });
    }

    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("Product get error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.listByBusiness = async (req, res) => {
  try {
    const item = await Products.findAll({
      where: { business_id: req.params.id },
      order: [["name", "ASC"]],
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }]
    });
    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    const expectedBusinessId = Number(req.query.business_id);
    if (expectedBusinessId && item.business_id !== expectedBusinessId) {
      return res.status(403).json({ status: "false", message: "Access denied: Product outside specified scope." });
    }

    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("Product get error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    let payload = req.body;
    let items;

    if (!Array.isArray(payload)) {
      if (!payload.name || !payload.category_id || payload.price === undefined || !payload.business_id) {
        return res.status(400).json({ status: "false", message: "Product name, category_id, price, and business_id are required." });
      }
      items = await Products.create(payload);
    } else {
      const isValidBulk = payload.every(p => p.name && p.category_id && p.price !== undefined && p.business_id);
      if (!isValidBulk) {
        return res.status(400).json({ status: "false", message: "All bulk items must contain name, category_id, price, and business_id." });
      }
      items = await Products.bulkCreate(payload, { validate: true });
    }

    res.status(201).json({ status: "true", data: items });
  } catch (e) {
    let message = e.message;
    if (e.name === 'SequelizeForeignKeyConstraintError' || (e.original && (e.original.code === 'SQLITE_CONSTRAINT' || e.original.errno === 1452))) {
      message = "Creation failed: The provided category_id or business_id does not exist.";
    } else if (e.name === 'SequelizeUniqueConstraintError') {
      message = "Creation failed: A product with this configuration already exists.";
    }

    console.error("❌ Error creating Products:", message);
    res.status(400).json({ status: "false", message: message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, category_id, price, business_id } = req.body;
    const item = await Products.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    const requiredBusinessId = Number(req.body.business_id || req.query.business_id);

    if (requiredBusinessId && item.business_id !== requiredBusinessId) {
      return res.status(403).json({ status: "false", message: "Access denied: Product outside your specified business scope." });
    }

    if (name !== undefined) item.name = name;
    if (price !== undefined) item.price = price;
    if (category_id !== undefined) item.category_id = category_id;
    if (description !== undefined) item.description = description;

    if (business_id !== undefined && business_id !== item.business_id) {
      return res.status(400).json({ status: "false", message: "Cannot change the owning business of a product." });
    }

    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("Product update error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Products.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Products not found" });
    }

    try {
      await item.destroy();
      res.json({ status: "true", message: "Products deleted successfully" });
    } catch (dbError) {
      if (dbError.name === 'SequelizeForeignKeyConstraintError' ||
        (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451 || dbError.original.code === 'SQLITE_CONSTRAINT'))) {
        const message = "Cannot delete this Product because it is currently linked to one or more Leads, Quotations, or Sales Orders.";
        return res.status(409).json({
          status: "false",
          message: message,
          error_type: "ForeignKeyConstraintError"
        });
      }
      throw dbError;
    }

  } catch (e) {
    console.error("Products remove error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};