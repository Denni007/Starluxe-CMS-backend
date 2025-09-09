// app/controller/rolePermission.controller.js
const { Op } = require("sequelize");
const { sequelize, Role, Permission, RolePermission } = require("../models");

const ALLOWED_ACTIONS = ["view", "create", "update", "delete"];

/* ----------------------------- helpers ----------------------------- */

// Ensure role exists (branch/business not required anymore)
async function getRole(role_id, t) {
  const role = await Role.findByPk(role_id, { transaction: t });
  if (!role) throw new Error(`Role ${role_id} not found`);
  return role;
}

// Resolve to permission IDs from either { permission_ids } or { modules: [{module, actions?}] }
async function resolvePermissionIds(input, t) {
  const ids = new Set();

  if (Array.isArray(input.permission_ids) && input.permission_ids.length) {
    const rows = await Permission.findAll({
      where: { id: { [Op.in]: input.permission_ids } },
      attributes: ["id"],
      transaction: t,
    });
    if (rows.length !== input.permission_ids.length) {
      throw new Error("One or more permission_ids are invalid");
    }
    rows.forEach(r => ids.add(r.id));
  }

  if (Array.isArray(input.modules) && input.modules.length) {
    const needed = [];
    for (const item of input.modules) {
      if (!item || !item.module) throw new Error("Each modules[] item must have 'module'");
      const actions = Array.isArray(item.actions) && item.actions.length ? item.actions : ALLOWED_ACTIONS;
      for (const a of actions) {
        if (!ALLOWED_ACTIONS.includes(a)) throw new Error(`Invalid action '${a}' for module '${item.module}'`);
        needed.push({ module: String(item.module).trim(), action: a });
      }
    }
    if (needed.length) {
      const rows = await Permission.findAll({
        where: { [Op.or]: needed.map(n => ({ module: n.module, action: n.action })) },
        attributes: ["id", "module", "action"],
        transaction: t,
      });
      const found = new Set(rows.map(r => `${r.module}:${r.action}`));
      for (const n of needed) {
        const key = `${n.module}:${n.action}`;
        if (!found.has(key)) throw new Error(`Permission not found: ${key}`);
      }
      rows.forEach(r => ids.add(r.id));
    }
  }

  if (!ids.size) throw new Error("No permissions specified (permission_ids or modules required)");
  return Array.from(ids);
}

function formatGrouped(rps) {
  const grouped = {};
  for (const rp of rps) {
    const p = rp.permission;
    if (!p) continue;
    if (!grouped[p.module]) grouped[p.module] = { module: p.module, actions: [], permission_ids: [] };
    grouped[p.module].actions.push(p.action);
    grouped[p.module].permission_ids.push(p.id);
  }
  return Object.values(grouped).sort((a, b) => a.module.localeCompare(b.module));
}

/* ----------------------------- endpoints ----------------------------- */

// GET /api/role-permissions/:roleId  → modules grouped with actions + permission_ids
exports.listByRole = async (req, res) => {
  try {
    const role_id = Number(req.params.roleId);
    if (!role_id) return res.status(400).json({ status: "false", message: "roleId is required" });
    await getRole(role_id);

    const rows = await RolePermission.findAll({
      where: { role_id },
      include: [{ model: Permission, as: "permission", attributes: ["id", "module", "action"] }],
      order: [[{ model: Permission, as: "permission" }, "module", "ASC"], [{ model: Permission, as: "permission" }, "action", "ASC"]],
    });

    const data = formatGrouped(rows);
    res.json({ status: "true", data });
  } catch (e) {
    console.error("listByRole error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

// POST /api/role-permissions/assign  (permission_ids OR modules/actions)
exports.assign = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    if (!role_id) throw new Error("role_id is required");
    await getRole(role_id, t);

    const permissionIds = await resolvePermissionIds(req.body, t);

    await RolePermission.bulkCreate(
      permissionIds.map(id => ({ role_id, permission_id: id })),
      { validate: true, ignoreDuplicates: true, transaction: t }
    );

    await t.commit();
    return exports.listByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("assign error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

// POST /api/role-permissions/revoke  (permission_ids OR modules/actions)
exports.revoke = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    if (!role_id) throw new Error("role_id is required");
    await getRole(role_id, t);

    const permissionIds = await resolvePermissionIds(req.body, t);

    await RolePermission.destroy({
      where: { role_id, permission_id: { [Op.in]: permissionIds } },
      transaction: t,
    });

    await t.commit();
    return exports.listByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("revoke error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

// GET /api/role-permissions/:roleId/ids  → { role_id, permission_ids: [] }
exports.getIdsByRole = async (req, res) => {
  try {
    const role_id = Number(req.params.roleId);
    if (!role_id) return res.status(400).json({ status: "false", message: "roleId is required" });
    await getRole(role_id);

    const rows = await RolePermission.findAll({
      where: { role_id },
      attributes: ["permission_id"],
    });

    return res.json({ status: "true", role_id, permission_ids: rows.map(r => r.permission_id) });
  } catch (e) {
    console.error("getIdsByRole error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

// POST /api/role-permissions/set-ids  → overwrite exactly to array
exports.setIds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    const permission_ids = Array.isArray(req.body.permission_ids) ? req.body.permission_ids.map(Number) : [];
    if (!role_id || !permission_ids.length) throw new Error("role_id and non-empty permission_ids[] are required");
    await getRole(role_id, t);

    // validate all permission ids exist
    const perms = await Permission.findAll({
      where: { id: { [Op.in]: permission_ids } },
      attributes: ["id"],
      transaction: t,
    });
    if (perms.length !== permission_ids.length) throw new Error("One or more permission_ids are invalid");

    // diff & apply
    const current = await RolePermission.findAll({ where: { role_id }, attributes: ["permission_id"], transaction: t });
    const currentIds = new Set(current.map(rp => rp.permission_id));
    const desiredIds = new Set(permission_ids);

    const toAdd = [...desiredIds].filter(id => !currentIds.has(id));
    const toRemove = [...currentIds].filter(id => !desiredIds.has(id));

    if (toAdd.length) {
      await RolePermission.bulkCreate(
        toAdd.map(id => ({ role_id, permission_id: id })),
        { validate: true, ignoreDuplicates: true, transaction: t }
      );
    }
    if (toRemove.length) {
      await RolePermission.destroy({
        where: { role_id, permission_id: { [Op.in]: toRemove } },
        transaction: t,
      });
    }

    await t.commit();
    return exports.getIdsByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("setIds error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

// POST /api/role-permissions/append-ids  → add array
exports.appendIds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    const permission_ids = Array.isArray(req.body.permission_ids) ? req.body.permission_ids.map(Number) : [];
    if (!role_id || !permission_ids.length) throw new Error("role_id and non-empty permission_ids[] are required");
    await getRole(role_id, t);

    // validate existence
    const perms = await Permission.findAll({ where: { id: { [Op.in]: permission_ids } }, attributes: ["id"], transaction: t });
    if (perms.length !== permission_ids.length) throw new Error("One or more permission_ids are invalid");

    await RolePermission.bulkCreate(
      permission_ids.map(id => ({ role_id, permission_id: id })),
      { validate: true, ignoreDuplicates: true, transaction: t }
    );

    await t.commit();
    return exports.getIdsByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("appendIds error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

// POST /api/role-permissions/remove-ids  → remove array
exports.removeIds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    const permission_ids = Array.isArray(req.body.permission_ids) ? req.body.permission_ids.map(Number) : [];
    if (!role_id || !permission_ids.length) throw new Error("role_id and non-empty permission_ids[] are required");
    await getRole(role_id, t);

    await RolePermission.destroy({
      where: { role_id, permission_id: { [Op.in]: permission_ids } },
      transaction: t,
    });

    await t.commit();
    return exports.getIdsByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("removeIds error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};
