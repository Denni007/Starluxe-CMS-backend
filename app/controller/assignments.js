const { UserBusinessRole, User, Business, Branch, Role } = require("../models");

/**
 * Validate foreign keys + business consistency
 */
async function validateLinks({ user_id, business_id, branch_id, role_id }) {
  const [user, business, branch, role] = await Promise.all([
    User.findByPk(user_id),
    Business.findByPk(business_id),
    Branch.findByPk(branch_id),
    Role.findByPk(role_id),
  ]);

  if (!user) return "Invalid user";
  if (!business) return "Invalid business";
  if (!branch) return "Invalid branch";
  if (!role) return "Invalid role";

  if (branch.business_id !== business.id) return "Branch must belong to business";
  if (role.business_id && role.business_id !== business.id)
    return "Role must belong to the same business";

  return null;
}

/**
 * POST /assignments
 * Create or upsert a single assignment
 */
exports.create = async (req, res) => {
  try {
    const { user_id, business_id, branch_id, role_id } = req.body;

    const err = await validateLinks({ user_id, business_id, branch_id, role_id });
    if (err) return res.status(400).json({ status: "false", message: err });

    // Upsert (note: return signature can vary by dialect)
    const result = await UserBusinessRole.upsert({
      user_id,
      business_id,
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

    const rows = await UserBusinessRole.bulkCreate(payload, {
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
    const { page = 1, limit = 50, user_id, business_id, branch_id, role_id } = req.query;
    const where = {
      ...(user_id ? { user_id: Number(user_id) } : {}),
      ...(business_id ? { business_id: Number(business_id) } : {}),
      ...(branch_id ? { branch_id: Number(branch_id) } : {}),
      ...(role_id ? { role_id: Number(role_id) } : {}),
    };

    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));

    const { rows, count } = await UserBusinessRole.findAndCountAll({
      where,
      include: [
        { model: User, as: "user" },
        { model: Business, as: "business" },
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
    const rows = await UserBusinessRole.findAll({
      where: { user_id: Number(req.params.userId) },
      include: ["business", "branch", "role"],
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
    const row = await UserBusinessRole.findByPk(req.params.id, {
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
 * Update any fields (e.g., role_id, branch_id, business_id)
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // If FK fields present, validate consistency
    const { user_id, business_id, branch_id, role_id } = req.body || {};
    if (user_id || business_id || branch_id || role_id) {
      const err = await validateLinks({
        user_id: user_id ?? (await UserBusinessRole.findByPk(id))?.user_id,
        business_id: business_id ?? (await UserBusinessRole.findByPk(id))?.business_id,
        branch_id: branch_id ?? (await UserBusinessRole.findByPk(id))?.branch_id,
        role_id: role_id ?? (await UserBusinessRole.findByPk(id))?.role_id,
      });
      if (err) return res.status(400).json({ status: "false", message: err });
    }

    const [n] = await UserBusinessRole.update(req.body, { where: { id } });
    if (!n) return res.status(404).json({ status: "false", message: "Not found" });

    const row = await UserBusinessRole.findByPk(id, { include: ["user", "business", "branch", "role"] });
    res.json({ status: "true", data: row });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
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
      const { user_id, business_id, branch_id, role_id } = data;
      if (user_id || business_id || branch_id || role_id) {
        const current = await UserBusinessRole.findByPk(id);
        if (!current) continue;
        const err = await validateLinks({
          user_id: user_id ?? current.user_id,
          business_id: business_id ?? current.business_id,
          branch_id: branch_id ?? current.branch_id,
          role_id: role_id ?? current.role_id,
        });
        if (err) return res.status(400).json({ status: "false", message: err, id });
      }

      const [n] = await UserBusinessRole.update(data, { where: { id } });
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
    const n = await UserBusinessRole.destroy({ where: { id: req.params.id } });
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
    const n = await UserBusinessRole.destroy({ where: { id: ids } });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
