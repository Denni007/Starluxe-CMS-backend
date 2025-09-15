// app/controller/role.controller.js
// CommonJS + unified responses { status: "true"/"false", ... }

// const Role = require("../models/role.js");
// const Branch = require("../models/branch.js");
// const User = require("../models/user.js");
// const UserBranchRole = require("../models/UserBranchRole.js");
// const RolePermission = require("../models/RolePermission.js");
// const Permission = require("../models/permission.js");
const { Op } = require("sequelize");
const { sequelize, Role, Permission, RolePermission, Branch, User, UserBranchRole } = require("../models");



exports.list = async (req, res) => {
  try {
    const items = await Role.findAll({ order: [["id", "DESC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await Role.findByPk(req.params.id, {
      include: [
        { model: Branch, as: "branch" },
      ],
    });
    if (!item) return res.status(404).json({ status: "false", message: "Role not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.listByBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const roles = await Role.findAll({
      where: { branch_id:id },
      attributes: ["id", "name", "description", "branch_id"],

      order: [["id", "DESC"]],
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "type", "city", "business_id"],
        },
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "module", "action"],
          through: { attributes: [] }, // hide pivot
        },
        
        {
          model: RolePermission,
          as: "role_permissions",
          attributes: ["id", "permission_id"],
        },
      ],
    });

    // attach role_permission_ids array
    const data = roles.map((r) => {
      const j = r.toJSON();
      const perms = j?.permissions || [];
      j.role_permission_ids = perms.map((p) => p.id);
      return j;
    });

    return res.json({ status: "true", data });
  } catch (e) {
    console.error("listRolesByBranch error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

exports.listByBranchUser = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await UserBranchRole.findAll({
      where: { branch_id: id },
      order: [["id", "DESC"]],
      include: [
        // Branch info (via UBR -> Branch)
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },

        // User who holds this membership
        { model: User, as: "user", attributes: ["id", "email", "user_name", "first_name", "last_name", "is_admin", "is_active"] },

        // Role + its permissions (M2M through role_permissions)
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "description", "branch_id"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["id", "module", "action"],
              through: { attributes: [] }, // hide pivot columns
            },
            // (optional) also expose raw join rows if you want them
            {
              model: RolePermission,
              as: "role_permissions",
              attributes: ["id", "permission_id"],
            },
          ],
        },
      ],
    });

    // Optionally add a convenience array of permission IDs on each role
    const data = items.map((m) => {
      const j = m.toJSON();
      const perms = j?.role?.permissions || [];
      j.role_permission_ids = perms.map((p) => p.id);
      return j;
    });

    return res.json({ status: "true", data });
  } catch (e) {
    console.error("listByBranch error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

exports.createWithPermissions = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id || null;
    const {
      name,
      description = null,
      branch_id,
      permission_ids = [],
    } = req.body || {};

    if (!name || !branch_id) {
      await t.rollback();
      return res.status(400).json({ status: "false", message: "name and branch_id are required" });
    }

    // verify branch exists
    const branch = await Branch.findByPk(branch_id, { transaction: t });
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ status: "false", message: `Branch ${branch_id} not found` });
    }

    // clean & check permission IDs
    const permIds = [...new Set(
      (Array.isArray(permission_ids) ? permission_ids : [])
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n > 0)
    )];

    if (permIds.length) {
      const existing = await Permission.findAll({
        where: { id: { [Op.in]: permIds } },
        attributes: ["id"],
        transaction: t,
      });
      const existingSet = new Set(existing.map((p) => p.id));
      const missing = permIds.filter((id) => !existingSet.has(id));
      if (missing.length) {
        await t.rollback();
        return res.status(400).json({
          status: "false",
          message: `Invalid permission_ids: ${missing.join(", ")}`,
        });
      }
    }
    else{
      await t.rollback();
      return res.status(400).json({ status: "false", message: "role can't create with out any permission" });
    }
    // 1) create role
    const role = await Role.create(
      {
        name,
        description,
        branch_id: branch.id,
        created_by: userId,
        updated_by: userId,
      },
      { transaction: t }
    );

    // 2) link Role → Permissions
    if (permIds.length) {
      await RolePermission.bulkCreate(
        permIds.map((pid) => ({ role_id: role.id, permission_id: pid })),
        { validate: true, ignoreDuplicates: true, transaction: t }
      );
    }

    // 3) ensure superadmins get this role on this branch
    // const superAdmins = await User.findAll({
    //   where: { is_admin: true },
    //   attributes: ["id"],
    //   transaction: t,
    // });

    // for (const sa of superAdmins) {
    //   await UserBranchRole.findOrCreate({
    //     where: { user_id: sa.id, branch_id: branch.id, role_id: role.id },
    //     defaults: {
    //       user_id: sa.id,
    //       branch_id: branch.id,
    //       role_id: role.id,
    //     },
    //     transaction: t,
    //   });
    // }

    // // 4) if creator is not superadmin, still assign him/her too
    // if (userId && !superAdmins.some((sa) => sa.id === userId)) {
    //   await UserBranchRole.findOrCreate({
    //     where: { user_id: userId, branch_id: branch.id, role_id: role.id },
    //     defaults: {
    //       user_id: userId,
    //       branch_id: branch.id,
    //       role_id: role.id,
    //     },
    //     transaction: t,
    //   });
    // }

    await t.commit();

    // reload with permissions
    const roleWithPerms = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "module", "action"],
          through: { attributes: [] },
        },
      ],
    });

    return res.status(201).json({
      status: "true",
      message: "Role created & assigned",
      data: roleWithPerms,
    });
  } catch (e) {
    if (t && !t.finished) await t.rollback();
    console.error("❌ createWithPermissions error:", e);
    return res.status(400).json({ status: "false", message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Role.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Not found" });
    await item.update(req.body);
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
exports.updateRole = async (req, res) => {
  try {
    // handle case where frontend sends JSON string in `data`
    let body = req.body;
    if (body && typeof body.data === "string") {
      try {
        const parsed = JSON.parse(body.data);
        body = { ...body, ...parsed };
      } catch (parseErr) {
        // ignore parse error and continue with original body
      }
    }
    // console.log(body)

    const roleId = Number(req.params.id);
    if (!roleId) return res.status(400).json({ status: "false", message: "role id required" });

    const { name, description } = body;
    const incomingPermIdsRaw = Array.isArray(body.permission_ids) ? body.permission_ids : [];

    // Normalize permission ids: accept numeric or numeric-strings, dedupe
    const incomingPermIds = [...new Set(
      incomingPermIdsRaw
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n > 0)
    )];

    // Managed transaction ensures commit/rollback is automatic
    const result = await sequelize.transaction(async (t) => {
      // 1) Ensure role exists
      const role = await Role.findByPk(roleId, { transaction: t });
      if (!role) {
        const err = new Error(`Role ${roleId} not found`);
        err.statusCode = 404;
        throw err;
      }

      // 2) Update role attributes (only if provided)
      const updates = {};
      if (typeof name !== "undefined") updates.name = name;
      if (typeof description !== "undefined") updates.description = description;
      if (Object.keys(updates).length) {
        await role.update(updates, { transaction: t });
      }

      // 3) Validate incoming permission IDs exist in permissions table
      if (incomingPermIds.length) {
        const existingPerms = await Permission.findAll({
          where: { id: { [Op.in]: incomingPermIds } },
          attributes: ["id"],
          transaction: t,
        });
        const existingSet = new Set(existingPerms.map((p) => p.id));
        const missing = incomingPermIds.filter((id) => !existingSet.has(id));
        if (missing.length) {
          const err = new Error(`Invalid permission_ids: ${missing.join(", ")}`);
          err.statusCode = 400;
          throw err;
        }
      }

      // 4) Read current RolePermission rows for this role
      const currentRP = await RolePermission.findAll({
        where: { role_id: roleId },
        attributes: ["id", "permission_id"],
        transaction: t,
      });
      const currentPermIds = currentRP.map((r) => r.permission_id);

      // 5) Compute toAdd / toRemove
      const toAdd = incomingPermIds.filter((id) => !currentPermIds.includes(id));
      const toRemove = currentPermIds.filter((id) => !incomingPermIds.includes(id));

      // 6) Bulk insert new RolePermission rows (ignore duplicates)
      if (toAdd.length) {
        await RolePermission.bulkCreate(
          toAdd.map((pid) => ({ role_id: roleId, permission_id: pid })),
          { validate: true, ignoreDuplicates: true, transaction: t }
        );
      }

      // 7) Remove RolePermission rows that are not desired anymore
      if (toRemove.length) {
        await RolePermission.destroy({
          where: { role_id: roleId, permission_id: { [Op.in]: toRemove } },
          transaction: t,
        });
      }

      // 8) Return the updated role with permissions + role_permissions
      const roleWithPerms = await Role.findByPk(roleId, {
        transaction: t,
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["id", "module", "action"],
            through: { attributes: [] },
          },
          {
            model: RolePermission,
            as: "role_permissions",
            attributes: ["id", "permission_id"],
          },
        ],
      });

      return roleWithPerms;
    }); // transaction auto-committed if we reach here

    // Format response: add role_permission_ids array
    const json = result.toJSON();
    const perms = json.role?.permissions || json.permissions || [];
    json.role_permission_ids = perms.map((p) => p.id);

    return res.json({
      status: "true",
      message: "Role updated",
      data: json,
    });
  } catch (err) {
    // managed transaction already rolled back when thrown inside transaction block
    console.error("❌ update role error:", err);
    if (err && err.statusCode === 404) {
      return res.status(404).json({ status: "false", message: err.message });
    }
    return res.status(400).json({ status: "false", message: err.message || "Failed to update role" });
  }
};

exports.remove = async (req, res) => {
  const roleId = Number(req.params.id);
  if (!roleId) return res.status(400).json({ status: "false", message: "role id required" });

  try {
    // managed transaction: commit/rollback auto-handled by sequelize
    const result = await sequelize.transaction(async (t) => {
      // 1) ensure role exists
      const role = await Role.findByPk(roleId, { transaction: t });
      if (!role) {
        // throwing inside managed transaction will rollback automatically
        const err = new Error(`Role ${roleId} not found`);
        err.statusCode = 404;
        throw err;
      }

      // 2) Remove RolePermission join rows for this role
      const deletedRolePermCount = await RolePermission.destroy({
        where: { role_id: roleId },
        transaction: t,
      });

      // 3) Remove UserBranchRole rows for this role (memberships)
      const deletedUserBranchRoleCount = await UserBranchRole.destroy({
        where: { role_id: roleId },
        transaction: t,
      });

      // 4) Delete the Role itself
      const deletedRoleCount = await Role.destroy({
        where: { id: roleId },
        transaction: t,
      });

      // Return summary
      return {
        roleId,
        roleName: role.name,
        deletedRolePermCount,
        deletedUserBranchRoleCount,
        deletedRoleCount,
      };
    }); // transaction ends here

    // success response
    return res.json({
      status: "true",
      message: `Role ${result.roleName} (id=${result.roleId}) deleted`,
      deleted: {
        role_permissions: result.deletedRolePermCount,
        user_branch_roles: result.deletedUserBranchRoleCount,
        roles: result.deletedRoleCount,
      },
    });
  } catch (e) {
    console.error("❌ Role remove error:", e);

    // If we threw a 404 above, return it
    if (e && e.statusCode === 404) {
      return res.status(404).json({ status: "false", message: e.message });
    }

    return res.status(400).json({ status: "false", message: e.message || "Failed to delete role" });
  }
};