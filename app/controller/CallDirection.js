const CallDirection = require("../models/CallDirection.js");
const Call = require("../models/call.js"); // Needed for Foreign Key Check

/**
 * List all Call Directions (Lookup Table).
 * exports.list
 */
exports.list = async (req, res) => {
  try {
    const items = await CallDirection.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    console.error("CallDirection list error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Get a single Call Direction by ID.
 * exports.get
 */
exports.get = async (req, res) => {
  try {
    const item = await CallDirection.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "CallDirection not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("CallDirection get error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Create one or more Call Directions.
 * exports.create
 */
exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    if (Array.isArray(payload)) {
      items = await CallDirection.bulkCreate(payload, { validate: true });
    } else {
      items = await CallDirection.create(payload);
    }

    res.status(201).json({ status: "true", data: items });
  } catch (e) {
    // Check for unique constraint violation
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: "false", message: "A call direction with this name already exists." });
    }

    console.error("❌ Error creating Call Directions:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * Update an existing Call Direction.
 * exports.update
 */
exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const item = await CallDirection.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "CallDirection not found" });
    }

    const updates = {
      name: name !== undefined ? name : item.name,
      description: description !== undefined ? description : item.description,
    };

    await item.update(updates);

    res.json({ status: "true", data: item });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: "false", message: "A call direction with this name already exists." });
    }
    console.error("CallDirection update error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const item = await CallDirection.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "Call Direction not found" });
    }

    try {
      await item.destroy();
      res.json({ status: "true", message: "Call Direction deleted successfully" });
    } catch (dbError) {

      if (dbError.name === 'SequelizeForeignKeyConstraintError' ||
        (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451))) {

        const message = "Cannot delete this Customer Type because it is currently linked to one or more Calls. Please update or delete the linked Calls first.";

        return res.status(409).json({ 
          status: "false",
          message: message,
          error_type: "ForeignKeyConstraintError" 
        });
      }
      throw dbError;
    }

  } catch (e) {
    console.error("Call Direction remove error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};