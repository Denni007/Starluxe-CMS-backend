const { sequelize,UserBranchRole, User, Business, Branch, Role } = require("../models");
const  {Op} = require("sequelize");

/**
 * Validate foreign keys + business consistency
 */
async function validateLinks({ user_id,  branch_id, role_id }) {
  const [user, branch, role] = await Promise.all([
    User.findByPk(user_id),
    Branch.findByPk(branch_id),
    Role.findByPk(role_id),
  ]);

  if (!user) return "Invalid user";
  if (!branch) return "Invalid branch";
  if (!role) return "Invalid role";

  return null;
}

/**
 * POST /assignments
 * Create or upsert a single assignment
 */
exports.create = async (req, res) => {
  try {
    const { user_id,  branch_id, role_id } = req.body;
    if (!user_id || !branch_id || !role_id) {
      return res.status(400).json({ status: "false", message: "user_id, branch_id, role_id are required" });
    }

    const err = await validateLinks({ user_id,  branch_id, role_id });
    if (err) return res.status(400).json({ status: "false", message: err });

    // Upsert (note: return signature can vary by dialect)
    const result = await UserBranchRole.upsert({
      user_id,
      branch_id,
      role_id,
    });

    // Normalize "created" flag across dialects
    let row, created;
    if (Array.isArray(result)) {
      [row, created] = result;
    } else {
      row = result;
      created = false; // best effort default
    }

    res.json({
      status: "true",
      message: created ? "Assigned (new)" : "Updated",
      data: row,
    });
  } catch (e) {
    console.error("❌ Error assigning role:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * POST /assignments/bulk
 * Bulk create/update — array of {user_id,business_id,branch_id,role_id}
 */
exports.bulkCreate = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [];

    // Optional: validate each row (comment out for speed if constraints exist in DB)
    for (const r of payload) {
      const err = await validateLinks(r);
      if (err) return res.status(400).json({ status: "false", message: err, row: r });
    }

    const rows = await UserBranchRole.bulkCreate(payload, {
      validate: true,
      updateOnDuplicate: ["role_id", "business_id", "branch_id"],
    });

    res.json({ status: "true", count: rows.length, data: rows });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /assignments
 * Optional filters & pagination: ?page=&limit=&user_id=&business_id=&branch_id=&role_id=
 */
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id,  branch_id, role_id } = req.query;
    const where = {
      ...(user_id ? { user_id: Number(user_id) } : {}),
      ...(branch_id ? { branch_id: Number(branch_id) } : {}),
      ...(role_id ? { role_id: Number(role_id) } : {}),
    };

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));

    const { rows, count } = await UserBranchRole.findAndCountAll({
      where,
      include: [
        { model: User, as: "user" },
        { model: Branch, as: "branch" },
        { model: Role, as: "role" },
      ],
      limit: lim,
      offset: (pg - 1) * lim,
      order: [["id", "DESC"]],
    });

    res.json({
      status: "true",
      total: count,
      page: pg,
      pages: Math.ceil(count / lim),
      data: rows,
    });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /assignments/user/:userId
 */
exports.listByUser = async (req, res) => {
  try {
    const rows = await UserBranchRole.findAll({
      where: { user_id: Number(req.params.userId) },
      include: [ "branch", "role"],
      order: [["id", "DESC"]],
    });
    res.json({ status: "true", data: rows });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /assignments/:id
 */
exports.get = async (req, res) => {
  try {
    const row = await UserBranchRole.findByPk(req.params.id, {
      include: ["user", "business", "branch", "role"],
    });
    if (!row) return res.status(404).json({ status: "false", message: "Not found" });
    res.json({ status: "true", data: row });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /assignments/:id
 * Update any fields (e.g., role_id, branch_id)
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // If FK fields present, validate consistency
    const { user_id,  branch_id, role_id } = req.body || {};
    if (user_id || branch_id || role_id) {
      const err = await validateLinks({
        user_id: user_id ?? (await UserBranchRole.findByPk(id))?.user_id,
        branch_id: branch_id ?? (await UserBranchRole.findByPk(id))?.branch_id,
        role_id: role_id ?? (await UserBranchRole.findByPk(id))?.role_id,
      });
      if (err) return res.status(400).json({ status: "false", message: err });
    }

    const [n] = await UserBranchRole.update(req.body, { where: { id } });
    if (!n) return res.status(404).json({ status: "false", message: "Not found" });

    const row = await UserBranchRole.findByPk(id, { include: ["user", "business", "branch", "role"] });
    res.json({ status: "true", data: row });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const userIdParam = Number(req.params.id);
    if (!userIdParam || !Number.isInteger(userIdParam)) {
      return res.status(400).json({ status: "false", message: "valid user id is required in params" });
    }

    const body = req.body || {};
    const bodyRoleId = body.role_id ? Number(body.role_id) : null;
    const bodyBranchId = body.branch_id ? Number(body.branch_id) : null;

    if (!bodyRoleId) {
      return res.status(400).json({ status: "false", message: "role_id is required" });
    }

    // Use a managed transaction so rollback/commit are automatic
    const result = await sequelize.transaction(async (t) => {
      // 1) Validate user exists
      const user = await User.findByPk(userIdParam, { transaction: t });
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }

      // 2) Validate role exists and get its branch
      const role = await Role.findByPk(bodyRoleId, { transaction: t });
      if (!role) {
        const err = new Error("Invalid role_id");
        err.statusCode = 400;
        throw err;
      }
      const roleBranchId = Number(role.branch_id);

      // 3) Determine target branch (body branch takes precedence; otherwise derived from role)
      let targetBranchId = null;
      if (bodyBranchId) {
        targetBranchId = bodyBranchId;
        // role must belong to this branch
        if (roleBranchId !== targetBranchId) {
          throw new Error("Provided role_id does not belong to the provided branch_id");
        }
      } else {
        // derive from role
        targetBranchId = roleBranchId;
      }

      if (!targetBranchId || !Number.isInteger(targetBranchId)) {
        throw new Error("Could not determine target branch_id");
      }

      // 4) Ensure branch exists (defensive)
      const branch = await Branch.findByPk(targetBranchId, { transaction: t });
      if (!branch) {
        const err = new Error("Branch not found");
        err.statusCode = 404;
        throw err;
      }

      // 5) Find existing membership for this user+branch
      let membership = await UserBranchRole.findOne({
        where: { user_id: userIdParam, branch_id: targetBranchId },
        transaction: t,
      });

      // 6) If membership exists -> update role_id; else create new membership
      if (membership) {
        // extra safety: ensure there are no duplicate memberships for same user+branch (exclude this row)
        const duplicate = await UserBranchRole.findOne({
          where: {
            user_id: userIdParam,
            branch_id: targetBranchId,
            id: { [Op.ne]: membership.id },
          },
          transaction: t,
        });
        if (duplicate) {
          throw new Error("Duplicate membership exists for this user and branch. Resolve duplicates before updating.");
        }

        await membership.update(
          { role_id: bodyRoleId, updated_by: req.user?.id ?? null },
          { transaction: t }
        );
      } else {
        // Create new membership
        membership = await UserBranchRole.create(
          {
            user_id: userIdParam,
            branch_id: targetBranchId,
            role_id: bodyRoleId,
            created_by: req.user?.id ?? null,
            updated_by: req.user?.id ?? null,
          },
          { transaction: t }
        );
      }

      // 7) Reload membership with branch + role (+ role.permissions & role_permissions)
      const reloaded = await UserBranchRole.findByPk(membership.id, {
        transaction: t,
        include: [
          { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },
          {
            model: Role,
            as: "role",
            attributes: ["id", "name", "description", "branch_id"],
            include: [
              { model: sequelize.models.Permission, as: "permissions", attributes: ["id", "module", "action"], through: { attributes: [] } },
              { model: sequelize.models.RolePermission, as: "role_permissions", attributes: ["id", "permission_id"] },
            ],
          },
          // Note: we intentionally do not include user info per your request
        ],
      });

      return reloaded;
    }); // transaction auto-committed

    // Format role_permission_ids array for convenience (mirrors your desired shape)
    const json = result ? result.toJSON() : null;
    if (json && json.role) {
      const perms = json.role.permissions || [];
      json.role_permission_ids = perms.map((p) => p.id);
    }

    return res.json({ status: "true", data: json });
  } catch (err) {
    console.error("❌ updateRole error:", err);
    if (err && err.statusCode === 404) {
      return res.status(404).json({ status: "false", message: err.message });
    }
    return res.status(400).json({ status: "false", message: err.message || "Failed to update role" });
  }
};
/**
 * PUT /assignments/bulk
 * Bulk update — array of {id, ...fields}
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [];
    let updated = 0;

    for (const a of payload) {
      const { id, ...data } = a;
      if (!id) continue;

      // Optional: validate if FKs present
      const { user_id, branch_id, role_id } = data;
      if (user_id || branch_id || role_id) {
        const current = await UserBranchRole.findByPk(id);
        if (!current) continue;
        const err = await validateLinks({
          user_id: user_id ?? current.user_id,
          branch_id: branch_id ?? current.branch_id,
          role_id: role_id ?? current.role_id,
        });
        if (err) return res.status(400).json({ status: "false", message: err, id });
      }

      const [n] = await UserBranchRole.update(data, { where: { id } });
      updated += n;
    }

    res.json({ status: "true", updated });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /assignments/:id
 */
exports.remove = async (req, res) => {
  try {
    const n = await UserBranchRole.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ status: "false", message: "Not found" });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /assignments/bulk
 * Body: { ids: [] }
 */
exports.bulkRemove = async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    const n = await UserBranchRole.destroy({ where: { id: ids } });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
