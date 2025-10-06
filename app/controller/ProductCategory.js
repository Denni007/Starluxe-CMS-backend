const ProductCategory = require("../models/ProductCategory.js");
const Products = require("../models/product.js"); // To check for foreign key constraints

/**
 * List all Product Categories, optionally filtered by business_id.
 * GET /categories?business_id=1
 */
exports.list = async (req, res) => {
  try {
    const where = {};
    const businessId = Number(req.query.business_id);

    // Filter by business_id if provided (Crucial for multi-tenancy)
    if (businessId) {
      where.business_id = businessId;
    }

    const items = await ProductCategory.findAll({
      where,
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    console.error("ProductCategory list error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Get a single Product Category by ID.
 * GET /categories/:id
 */
exports.get = async (req, res) => {
  try {
    const item = await ProductCategory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "ProductCategory not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("ProductCategory get error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Create one or more Product Categories.
 * POST /categories (Requires business_id in payload)
 */
exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    // Validate existence of business_id for single creation
    if (!Array.isArray(payload) && !payload.business_id) {
        return res.status(400).json({ status: "false", message: "business_id is required for creating a Product Category" });
    }
    // Validate existence of business_id for bulk creation (check first item)
    if (Array.isArray(payload) && payload.length > 0 && !payload[0].business_id) {
         return res.status(400).json({ status: "false", message: "business_id is required in payload for bulk creation" });
    }


    if (Array.isArray(payload)) {
      // Bulk create
      items = await ProductCategory.bulkCreate(payload, { validate: true });
    } else {
      // Single create
      items = await ProductCategory.create(payload);
    }

    res.status(201).json({ status: "true", data: items });
  } catch (e) {
    // Check for unique constraint violation on name+business_id combination
    if (e.name === 'SequelizeUniqueConstraintError') {
         return res.status(409).json({ status: "false", message: "A category with this name already exists for this business." });
    }
    
    console.error("❌ Error creating Product Categories:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Update an existing Product Category.
 * PUT/PATCH /categories/:id
 */
exports.update = async (req, res) => {
  try {
    const { name, description, business_id } = req.body;
    const item = await ProductCategory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "ProductCategory not found" });
    }
    
    // NOTE: business_id is typically immutable after creation, but allowing update here
    // based on provided request body structure if needed.
    const updates = {
        name: name !== undefined ? name : item.name,
        description: description !== undefined ? description : item.description,
        business_id: business_id !== undefined ? business_id : item.business_id
    };

    // Assuming the request body does NOT contain 'color' as the ProductCategory model doesn't have it.
    
    await item.update(updates);

    res.json({ status: "true", data: item });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
         return res.status(409).json({ status: "false", message: "A category with this name already exists for this business." });
    }
    console.error("ProductCategory update error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const item = await ProductCategory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "ProductCategory not found" });
    }

    try {
      await item.destroy();
      res.json({ status: "true", message: "ProductCategory deleted successfully" });
    } catch (dbError) {

      if (dbError.name === 'SequelizeForeignKeyConstraintError' ||
        (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451))) {

        const message = "Cannot delete this Product Category because it is currently linked to one or more Leads. Please update or delete the linked Leads first.";

        return res.status(409).json({ 
          status: "false",
          message: message,
          error_type: "ForeignKeyConstraintError" 
        });
      }
      throw dbError;
    }

  } catch (e) {
    console.error("ProductCategory remove error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};