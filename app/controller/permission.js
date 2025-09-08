// app/controller/permission.controller.js
const Permission = require("../models/permission");
const { Op } = require("sequelize");

const ALLOWED_ACTIONS = ["create", "update", "delete", "view","access"];

/**
 * GET /permissions
 * Returns [{ module, actions: ["create","update","delete","view"] }, ...]
 */
exports.list = async (_req, res) => {
  try {
    const items = await Permission.findAll({
      attributes: ["id", "module", "action"],
      order: [["module", "ASC"], ["action", "ASC"]],
    });

    const grouped = new Map();
    for (const { module, action } of items) {
      if (!grouped.has(module)) grouped.set(module, new Set());
      grouped.get(module).add(action);
    }

    const data = Array.from(grouped.entries()).map(([module, actionsSet]) => ({
      module,
      actions: Array.from(actionsSet).sort(),
    }));

    res.json({ status: "true", data });
  } catch (e) {
    console.error("❌ Permission list error:", e);
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /permissions
 * Body: { module } OR [ { module }, ... ]
 * Auto-creates actions: create, update, delete, view
 */
exports.create = async (req, res) => {
  try {
    // Normalize payload to modules array
    let modules = [];
    if (Array.isArray(req.body)) {
      modules = req.body.map((r) => String(r.module || "").trim()).filter(Boolean);
    } else {
      const { module } = req.body || {};
      if (module) modules = [String(module).trim()];
    }

    if (!modules.length) {
      return res.status(400).json({ status: "false", message: "module is required" });
    }

    // Build rows to insert (4 actions per module)
    const rowsToCreate = [];
    for (const m of modules) {
      for (const action of ALLOWED_ACTIONS) {
        rowsToCreate.push({
          module: m,
          action,
          // If your model has a unique "code" column, uncomment:
          // code: `${m}:${action}`,
        });
      }
    }

    // Insert (skip duplicates if unique index exists on (module, action) or code)
    await Permission.bulkCreate(rowsToCreate, {
      validate: true,
      ignoreDuplicates: true,
    });

    // Return definitive rows
    const result = await Permission.findAll({
      where: {
        module: { [Op.in]: modules },
        action: { [Op.in]: ALLOWED_ACTIONS },
      },
      order: [["module", "ASC"], ["action", "ASC"]],
    });

    return res.status(201).json({ status: "true", data: result });
  } catch (e) {
    console.error("❌ Permission create error:", e);
    res.status(500).json({ status: "false", message: e.message });
  }
};

/* -------- Optional helpers (no business_id) -------- */

/**
 * DELETE /permissions/module/:module
 * Remove all actions under a module
 */
exports.removeModule = async (req, res) => {
  try {
    const n = await Permission.destroy({ where: { module: String(req.params.module || "").trim() } });
    if (!n) return res.status(404).json({ status: "false", message: "Module not found" });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /permissions/module/:module/action/:action
 * Remove a specific action under a module
 */
exports.removeAction = async (req, res) => {
  try {
    const module = String(req.params.module || "").trim();
    const action = String(req.params.action || "").trim();
    const n = await Permission.destroy({ where: { module, action } });
    if (!n) return res.status(404).json({ status: "false", message: "Not found" });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};
