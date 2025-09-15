// app/controller/permission.controller.js
const Permission = require("../models/permission");
const { Op } = require("sequelize");
const { RolePermission ,sequelize} = require("../models");

const ALLOWED_ACTIONS = ["create", "update", "delete", "view","access"];
const isAllowedAction = (action) => ALLOWED_ACTIONS.includes(action);

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

    // const data = Array.from(grouped.entries()).map(([module, actionsSet]) => ({
    //   module,
    //   actions: Array.from(actionsSet).sort(),
    // }));

    res.json({ status: "true", data:items });
  } catch (e) {
    console.error("❌ Permission list error:", e);
    res.status(400).json({ status: "false", message: e.message });
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

    return res.status(200).json({ status: "true", data: result });
  } catch (e) {
    console.error("❌ Permission create error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/* -------- Optional helpers (no business_id) -------- */

/**
 * DELETE /permissions/module/:module
 * Remove all actions under a module
 */
function resolveModel(name) {
  const sequelize = Permission.sequelize;
  // try via index export first (if you have it), then sequelize registry
  // return (db && db[name]) || (sequelize.models && sequelize.models[name]);
  return (sequelize.models && sequelize.models[name]) || null;
}

// Delete from common join tables if they exist
async function purgePermissionJoins(permIds, tx) {
  const candidates = [
    "RolePermission",
    "UserPermission",
    "BranchPermission",
    "WorkspacePermission",
  ];

  for (const name of candidates) {
    const M = resolveModel(name);
    if (!M || typeof M.destroy !== "function") continue;

    // Handle both snake_case and camelCase FK column names
    await M.destroy({
      where: {
        [Op.or]: [
          { permission_id: { [Op.in]: permIds } }
        ],
      },
      transaction: tx,
    });
  }
}

/**
 * DELETE /permissions/module/:module
 * Deep delete: removes all permissions for a module and any join-table rows.
 */
exports.removeModule = async (req, res) => {
  const moduleName = String(req.params.module || "").trim();
  if (!moduleName) return res.status(400).json({ status: "false", message: "module is required" });

  const sequelize = Permission.sequelize;
  const tx = await sequelize.transaction();

  try {
    const perms = await Permission.findAll({
      where: { module: moduleName },
      attributes: ["id"],
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (perms.length === 0) {
      await tx.rollback();
      return res.status(404).json({ status: "false", message: "Module not found" });
    }

    const permIds = perms.map(p => p.id);

    // 1) purge join tables first (if no ON DELETE CASCADE)
    await purgePermissionJoins(permIds, tx);

    // 2) delete permissions (all 5 entries)
    const deleted = await Permission.destroy({
      where: { id: { [Op.in]: permIds } },
      transaction: tx,
    });

    await tx.commit();
    return res.json({ status: "true", module: moduleName, deleted, permissionIds: permIds });
  } catch (e) {
    await tx.rollback();
    console.error("❌ removeModule error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /permissions/module/:module/action/:action
 * Deep delete a single action under a module (also purges joins).
 */
exports.removeAction = async (req, res) => {
  const moduleName = String(req.params.module || "").trim();
  const action = String(req.params.action || "").trim().toLowerCase();
  if (!moduleName || !action) {
    return res.status(400).json({ status: "false", message: "module and action are required" });
  }

  const sequelize = Permission.sequelize;
  const tx = await sequelize.transaction();

  try {
    const perm = await Permission.findOne({
      where: { module: moduleName, action },
      attributes: ["id"],
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!perm) {
      await tx.rollback();
      return res.status(404).json({ status: "false", message: "Not found" });
    }

    // purge joins
    await purgePermissionJoins([perm.id], tx);

    // delete the permission row
    await Permission.destroy({ where: { id: perm.id }, transaction: tx });

    await tx.commit();
    return res.json({ status: "true", deleted: 1, permissionId: perm.id });
  } catch (e) {
    await tx.rollback();
    console.error("❌ removeAction error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};
exports.syncFixedModule = async (req, res) => {
  try {
    const module = String(req.params.module || "").trim();
    if (!module) return res.status(400).json({ status: "false", message: "module is required" });

    // Create missing allowed actions (ignore if they already exist)
    await Permission.bulkCreate(
      ALLOWED_ACTIONS.map((action) => ({ module, action })),
      { validate: true, ignoreDuplicates: true }
    );

    // Remove any action rows under this module that are NOT allowed
    await Permission.destroy({
      where: {
        module,
        action: { [Op.notIn]: ALLOWED_ACTIONS },
      },
    });

    // Return current state
    const rows = await Permission.findAll({
      where: { module },
      attributes: ["id", "module", "action"],
      order: [["action", "ASC"]],
    });

    res.json({ status: "true", data: { module, actions: rows.map((r) => r.action) } });
  } catch (e) {
    console.error("❌ Permission syncFixedModule error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PATCH /permissions/module/:module
 * Body: { add?: string[], remove?: string[] }
 * - Only allowed actions are accepted
 * - add = upsert (ignoreDuplicates)
 * - remove = delete those actions for the module
 */
exports.patchModuleActions = async (req, res) => {
  const moduleName = String(req.params.module || "").trim();
  if (!moduleName) {
    return res.status(400).json({ status: "false", message: "module is required" });
  }

  // Normalize input
  const toAdd = Array.isArray(req.body?.add)
    ? req.body.add.map((a) => String(a).toLowerCase().trim()).filter(Boolean)
    : [];
  const toRemove = Array.isArray(req.body?.remove)
    ? req.body.remove.map((a) => String(a).toLowerCase().trim()).filter(Boolean)
    : [];

  // Validate actions
  for (const a of [...toAdd, ...toRemove]) {
    if (!isAllowedAction(a)) {
      return res
        .status(400)
        .json({ status: "false", message: `Invalid action '${a}'. Allowed: ${ALLOWED_ACTIONS.join(", ")}` });
    }
  }

  // Prevent contradictory asks
  const conflicts = toAdd.filter((a) => toRemove.includes(a));
  if (conflicts.length) {
    return res.status(400).json({
      status: "false",
      message: `Actions cannot be both added and removed in the same request: ${conflicts.join(", ")}`,
    });
  }

  const tx = await Permission.sequelize.transaction();
  try {
    // 1) ADD first (idempotent)
    if (toAdd.length) {
      await Permission.bulkCreate(
        toAdd.map((action) => ({ module: moduleName, action })),
        { validate: true, ignoreDuplicates: true, transaction: tx }
      );
    }

    // 2) For REMOVES: fetch IDs, purge joins, then delete
    if (toRemove.length) {
      const permsToRemove = await Permission.findAll({
        where: { module: moduleName, action: { [Op.in]: toRemove } },
        attributes: ["id"],
        transaction: tx,
        lock: tx.LOCK.UPDATE, // harmless on sqlite; effective on mysql/pg
      });

      const permIds = permsToRemove.map((p) => p.id);
      if (permIds.length) {
        // purge join rows first to avoid FK violations
        await purgePermissionJoins(permIds, tx);

        // now delete the permission rows
        await Permission.destroy({
          where: { id: { [Op.in]: permIds } },
          transaction: tx,
        });
      }
      // If nothing matched, we just proceed (no 404 for patch semantics)
    }

    // 3) Return current state for this module
    const rows = await Permission.findAll({
      where: { module: moduleName },
      attributes: ["action"],
      order: [["action", "ASC"]],
      transaction: tx,
    });

    await tx.commit();
    return res.json({
      status: "true",
      data: { module: moduleName, actions: rows.map((r) => r.action) },
    });
  } catch (e) {
    try {
      if (tx && tx.finished !== "commit" && tx.finished !== "rollback") {
        await tx.rollback();
      }
    } catch (_) {}
    console.error("❌ patchModuleActions error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /permissions/module/:module/rename
 * Body: { newModule: string }
 * Renames all rows from :module -> newModule
 */
exports.renameModule = async (req, res) => {
  try {
    const oldModule = String(req.params.module || "").trim();
    const newModule = String(req.body?.newModule || "").trim();
    if (!oldModule || !newModule) {
      return res.status(400).json({ status: "false", message: "old and new module are required" });
    }
    if (oldModule === newModule) {
      return res.status(200).json({ status: "true", message: "No changes. Module name identical." });
    }

    const [count] = await Permission.update(
      { module: newModule },
      { where: { module: oldModule } }
    );

    if (!count) {
      return res.status(404).json({ status: "false", message: "Module not found" });
    }

    const rows = await Permission.findAll({
      where: { module: newModule },
      attributes: ["id", "module", "action"],
      order: [["action", "ASC"]],
    });

    res.json({ status: "true", data: { module: newModule, actions: rows.map((r) => r.action) } });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      return res.status(409).json({ status: "false", message: "Target module already has these actions (conflict)." });
    }
    console.error("❌ Permission renameModule error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /permissions/module/:module/action/:action
 * Body: { newAction }
 * Change an action under a module to another ALLOWED action.
 */
exports.patchActions = async (req, res) => {
  const moduleName = String(req.params.module || "").trim();
  if (!moduleName) {
    return res.status(400).json({ status: "false", message: "module is required" });
  }

  // normalize inputs
  const addRaw = Array.isArray(req.body?.add) ? req.body.add : [];
  const removeRaw = Array.isArray(req.body?.remove) ? req.body.remove : [];
  const toAdd = addRaw.map((a) => String(a).toLowerCase().trim()).filter(Boolean);
  const toRemove = removeRaw.map((a) => String(a).toLowerCase().trim()).filter(Boolean);

  // validate actions
  for (const a of [...toAdd, ...toRemove]) {
    if (!isAllowedAction(a)) {
      return res.status(400).json({
        status: "false",
        message: `Invalid action '${a}'. Allowed: ${ALLOWED_ACTIONS.join(", ")}`,
      });
    }
  }

  // if an action appears in both add & remove, we will DELETE (skip add)
  const removeSet = new Set(toRemove);

  try {
    await sequelize.transaction(async (tx) => {
      // fetch existing actions for this module once
      const existing = await Permission.findAll({
        where: { module: moduleName },
        attributes: ["id", "action"],
        transaction: tx,
      });
      const existingActionSet = new Set(existing.map((r) => r.action));

      // ---- ADD: skip any that already exist OR that are also requested to be removed
      const toAddFiltered = toAdd.filter((a) => !existingActionSet.has(a) && !removeSet.has(a));
      const skippedExisting = toAdd.filter((a) => existingActionSet.has(a));
      const skippedConflicted = toAdd.filter((a) => removeSet.has(a)); // add+remove -> delete wins

      if (toAddFiltered.length) {
        await Permission.bulkCreate(
          toAddFiltered.map((action) => ({ module: moduleName, action })),
          { validate: true, ignoreDuplicates: true, transaction: tx }
        );
      }

      // ---- REMOVE: find IDs, purge joins, then delete by ID
      let removed = 0;
      let notFoundRemove = [];
      if (toRemove.length) {
        const rowsToRemove = await Permission.findAll({
          where: { module: moduleName, action: { [Op.in]: toRemove } },
          attributes: ["id", "action"],
          transaction: tx,
          // lock is a no-op on sqlite but safe on mysql/pg
        });

        const permIds = rowsToRemove.map((r) => r.id);
        const foundRemoveActions = new Set(rowsToRemove.map((r) => r.action));
        notFoundRemove = toRemove.filter((a) => !foundRemoveActions.has(a));

        if (permIds.length) {
          await purgePermissionJoins(permIds, tx);
          removed = await Permission.destroy({
            where: { id: { [Op.in]: permIds } },
            transaction: tx,
          });
        }
      }

      // return current state
      const after = await Permission.findAll({
        where: { module: moduleName },
        attributes: ["action"],
        order: [["action", "ASC"]],
        transaction: tx,
      });

      return res.json({
        status: "true",
        data: {
          module: moduleName,
          actions: after.map((r) => r.action),
          summary: {
            added: toAddFiltered,
            skipped_existing: skippedExisting,
            skipped_conflicted: skippedConflicted, // present in both add & remove → not added
            removed_count: removed,
            remove_not_found: notFoundRemove,
          },
        },
      });
    });
  } catch (e) {
    console.error("❌ Permission patchActions error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};