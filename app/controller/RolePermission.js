// app/controller/rolePermission.controller.js
const { Op } = require("sequelize");
const { sequelize, Role, Branch, Permission, RolePermission } = require("../models");

const ALLOWED_ACTIONS = ["view", "create", "update", "delete"];

// ------- helpers -------
async function getRoleAndBusiness(role_id, t) {
  const role = await Role.findByPk(role_id, {
    include: [{ model: Branch, as: "branch", attributes: ["id", "business_id"] }],
    transaction: t,
  });
  if (!role) throw new Error(`Role ${role_id} not found`);
  if (!role.branch) throw new Error(`Role ${role_id} has no branch assigned`);
  return { role, business_id: role.branch.business_id };
}

async function resolvePermissionIds(input, business_id, t) {
  const ids = new Set();

  if (Array.isArray(input.permission_ids) && input.permission_ids.length) {
    const rows = await Permission.findAll({
      where: { id: { [Op.in]: input.permission_ids } },
      attributes: ["id", "business_id"],
      transaction: t,
    });
    for (const r of rows) {
      if (r.business_id !== business_id) {
        throw new Error(`Permission ${r.id} does not belong to business ${business_id}`);
      }
      ids.add(r.id);
    }
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
        where: {
          business_id,
          [Op.or]: needed.map(n => ({ module: n.module, action: n.action })),
        },
        attributes: ["id", "module", "action"],
        transaction: t,
      });
      const found = new Set(rows.map(r => `${r.module}:${r.action}`));
      for (const n of needed) {
        const key = `${n.module}:${n.action}`;
        if (!found.has(key)) throw new Error(`Permission not found for business ${business_id}: ${key}`);
      }
      for (const r of rows) ids.add(r.id);
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

// ------- endpoints -------
exports.listByRole = async (req, res) => {
  try {
    const role_id = Number(req.params.roleId);
    if (!role_id) return res.status(400).json({ status: "false", message: "roleId is required" });

    const { business_id } = await getRoleAndBusiness(role_id);

    const rows = await RolePermission.findAll({
      where: { role_id },
      include: [{ model: Permission, as: "permission", attributes: ["id", "module", "action", "business_id"] }],
      order: [[{ model: Permission, as: "permission" }, "module", "ASC"], [{ model: Permission, as: "permission" }, "action", "ASC"]],
    });

    const data = formatGrouped(rows.filter(rp => rp.permission?.business_id === business_id));
    res.json({ status: "true", business_id, data });
  } catch (e) {
    console.error("listByRole error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.assign = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    if (!role_id) throw new Error("role_id is required");

    const { business_id } = await getRoleAndBusiness(role_id, t);
    const permissionIds = await resolvePermissionIds(req.body, business_id, t);

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

exports.revoke = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const role_id = Number(req.body.role_id);
    if (!role_id) throw new Error("role_id is required");

    const { business_id } = await getRoleAndBusiness(role_id, t);
    const permissionIds = await resolvePermissionIds(req.body, business_id, t);

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

exports.set = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { role_id, business_id, matrix } = req.body;
    if (!role_id || !business_id || !matrix) {
      return res.status(400).json({ status: "false", message: "role_id, business_id and matrix are required" });
    }

    const { business_id: roleBiz } = await getRoleAndBusiness(Number(role_id), t);
    if (Number(business_id) !== Number(roleBiz)) {
      throw new Error(`Role ${role_id} is not in business ${business_id}`);
    }

    // Build desired pairs
    const desiredPairs = [];
    for (const [moduleName, actions] of Object.entries(matrix)) {
      for (const act of ALLOWED_ACTIONS) {
        if (actions?.[act]) desiredPairs.push({ module: moduleName.trim(), action: act });
      }
    }

    const desiredPerms = await Permission.findAll({
      where: {
        business_id,
        [Op.or]: desiredPairs.map(p => ({ module: p.module, action: p.action })),
      },
      attributes: ["id", "module", "action"],
      transaction: t,
    });

    const found = new Set(desiredPerms.map(p => `${p.module}:${p.action}`));
    for (const p of desiredPairs) {
      const key = `${p.module}:${p.action}`;
      if (!found.has(key)) throw new Error(`Permission missing for business ${business_id}: ${key}`);
    }

    const desiredIds = new Set(desiredPerms.map(p => p.id));

    const current = await RolePermission.findAll({
      where: { role_id },
      attributes: ["permission_id"],
      transaction: t,
    });
    const currentIds = new Set(current.map(rp => rp.permission_id));

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
    return exports.listByRole(req, res);
  } catch (e) {
    await t.rollback();
    console.error("set error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};
