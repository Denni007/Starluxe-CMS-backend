// app/controller/permission.controller.js
const Permission = require("../models/Permission");
const { Op } = require("sequelize");

const ALLOWED_ACTIONS = ["create", "update", "delete", "view"];

/**
 * GET /permissions?business_id=1
 */
exports.list = async (req, res) => {
  try {
    const items = await Permission.findAll({
      order: [["business_id", "ASC"], ["module", "ASC"], ["action", "ASC"]],
    });

    // Group by business_id → module → actions[]
    const grouped = {};
    for (const item of items) {
      const bizId = item.business_id;
      if (!grouped[bizId]) {
        grouped[bizId] = {};
      }
      if (!grouped[bizId][item.module]) {
        grouped[bizId][item.module] = [];
      }
      grouped[bizId][item.module].push(item.action);
    }

    // Convert to array with explicit business_id field
    const data = Object.entries(grouped).map(([bizId, modules]) => ({
      business_id: Number(bizId),
      permissions: Object.entries(modules).map(([module, actions]) => ({
        module,
        actions,
      })),
    }));

    res.json({ status: "true", data });
  } catch (e) {
    console.error("❌ Permission list error:", e);
    res.status(500).json({ status: "false", message: e.message });
  }
};


/**
 * POST /permissions
 * Body: { business_id, module } OR [ { business_id, module }, ... ]
 * Automatically creates 4 actions (create, update, delete, view)
 */
exports.create = async (req, res) => {
  try {
    // normalize payload to [{ business_id, module }, ...] as you already do
    let modules = [];
    if (Array.isArray(req.body)) {
      modules = req.body.map(({ business_id, module }) => ({
        business_id: Number(business_id),
        module: String(module).trim(),
      }));
    } else {
      const { business_id, module } = req.body;
      modules = [{ business_id: Number(business_id), module: String(module).trim() }];
    }

    // build rows to insert (4 actions per module)
    const rowsToCreate = [];
    for (const m of modules) {
      for (const action of ALLOWED_ACTIONS) {
        rowsToCreate.push({
          business_id: m.business_id,
          module: m.module,
          action,
        });
      }
    }

    // insert (duplicates skipped)
    await Permission.bulkCreate(rowsToCreate, {
      validate: true,
      ignoreDuplicates: true, // causes skipped rows to come back as id: null
    });

    // ✅ fetch the definitive rows (with IDs) to return
    const businessIds = [...new Set(modules.map(m => m.business_id))];
    const moduleNames = [...new Set(modules.map(m => m.module))];

    const result = await Permission.findAll({
      where: {
        business_id: { [Op.in]: businessIds },
        module: { [Op.in]: moduleNames },
        action: { [Op.in]: ALLOWED_ACTIONS },
      },
      order: [["module", "ASC"], ["action", "ASC"]],
    });

    return res.status(201).json({ status: "true", data: result });
  } catch (e) {
    console.error("Permission create error:", e);
    res.status(500).json({ status: "false", message: e.message });
  }
};
