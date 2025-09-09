// app/controller/users.js
// CommonJS controller for /users*
// Unified responses: { status: "true"/"false", ... }

const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Expect these from your models index (adjust if paths/aliases differ)
const {
  User,
  UserBranchRole,
  Business,
  Branch,
  Role,
  Permission,       // <--- add this

} = require("../models");

// ---- helpers ----
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Check only the provided fields for uniqueness.
 * Returns a string error message if a duplicate exists, else null.
 */
async function checkUserUniqueness(fields, excludeUserId) {
  if (!fields || Object.keys(fields).length === 0) return null;

  const idFilter = excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {};

  if (hasOwn(fields, "email")) {
    const found = await User.findOne({ where: { email: fields.email, ...idFilter } });
    if (found) return "Email already exists";
  }
  if (hasOwn(fields, "user_name")) {
    const found = await User.findOne({ where: { user_name: fields.user_name, ...idFilter } });
    if (found) return "Username already taken";
  }
  if (hasOwn(fields, "mobile_number")) {
    const found = await User.findOne({ where: { mobile_number: fields.mobile_number, ...idFilter } });
    if (found) return "Mobile number already registered";
  }
  return null;
}

// Helper function to normalize user body (from auth.js or similar)
function normalizeUserBody(body) {
  return {
    email: body.email ? String(body.email).trim().toLowerCase() : undefined,
    first_name: body.first_name ? String(body.first_name).trim() : undefined,
    last_name: body.last_name ? String(body.last_name).trim() : undefined,
    mobile_number: body.mobile_number ? String(body.mobile_number).trim() : undefined,
    password: body.password,
    user_name: body.user_name ? String(body.user_name).trim() : undefined,
    gender: body.gender ? String(body.gender).trim() : undefined,
    is_admin: typeof body.is_admin === 'boolean' ? body.is_admin : undefined,
    is_email_verify: typeof body.is_email_verify === 'boolean' ? body.is_email_verify : undefined,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : undefined,

  };
}

// ---- helpers -------------------------------------------------------------

function includeMemberships(required = false, filters = {}, opts = {}) {
  const where = {};
  if (filters.business_id) where.business_id = Number(filters.business_id);
  if (filters.branch_id) where.branch_id = Number(filters.branch_id);
  if (filters.role_id) where.role_id = Number(filters.role_id);

  const roleInclude = {
    model: Role,
    as: "role",
    attributes: ["id", "name", "description", "branch_id"],
  };

  if (opts.withPermissions) {
    roleInclude.include = [
      {
        model: Permission,
        as: "permissions",                  // <-- requires Role.belongsToMany(Permission, { as: "permissions", through: ... })
        attributes: ["id", "module", "action"],
        through: { attributes: [] },        // hide join table fields
      },
    ];
  }

  return {
    model: UserBranchRole,
    as: "memberships",
    where: Object.keys(where).length ? where : undefined,
    required,
    include: [
      { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"],  include: [
        { model: Business, as: "business", attributes: ["id", "name"] }, // ← derive business via branch
      ]},
      roleInclude,
    ],
  };
}

// ⬇️ tiny helper to group permissions by module → actions[]
function groupPerms(perms = []) {
  const map = new Map();
  for (const p of perms) {
    if (!map.has(p.module)) map.set(p.module, new Set());
    map.get(p.module).add(p.action);
  }
  return Array.from(map.entries()).map(([module, actions]) => ({
    module,
    actions: Array.from(actions).sort(),
  }));
}


// ---- controller actions --------------------------------------------------

/**
 * POST /users
 * Create single user
 */
exports.create = async (req, res) => {
  try {
    const b = normalizeUserBody(req.body);
    const required = ["email", "first_name", "last_name", "mobile_number", "user_name", "gender", "password"];
    for (const key of required) {
      if (!b[key]) return res.status(400).json({ status: "false", message: `${key} is required` });
    }

    if (b.password && String(b.password).length < 6) {
      return res.status(400).json({ status: "false", message: "Password must be at least 6 characters long" });
    }

    const dupMsg = await uniquenessChecks(b);
    if (dupMsg) return res.status(400).json({ status: "false", message: dupMsg });

    const hashed = await bcrypt.hash(String(b.password), 10);
    const user = await User.create({
      email: b.email,
      first_name: b.first_name,
      last_name: b.last_name,
      mobile_number: String(b.mobile_number),
      user_name: b.user_name,
      gender: b.gender,
      password: hashed,
      is_admin: !!b.is_admin,
      is_email_verify: !!b.is_email_verify,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    });

    return res.status(200).json({ status: "true", data: user });
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError" && e.errors?.[0]) {
      return res.status(400).json({ status: "false", message: e.errors[0].message });
    }
    if (e.name === "SequelizeValidationError" && e.errors?.[0]) {
      return res.status(400).json({ status: "false", message: e.errors[0].message });
    }
    return res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * POST /users/bulk
 * Bulk create users
 */
exports.bulkCreate = async (req, res) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : [];
    if (!arr.length) return res.status(400).json({ status: "false", message: "Array body required" });

    const rows = [];
    for (const raw of arr) {
      const b = normalizeUserBody(raw);
      const required = ["email", "first_name", "last_name", "mobile_number", "user_name", "gender", "password"];
      for (const key of required) {
        if (!b[key]) return res.status(400).json({ status: "false", message: `Row missing ${key}`, row: b });
      }
      const dupMsg = await uniquenessChecks(b);
      if (dupMsg) return res.status(400).json({ status: "false", message: dupMsg, row: b });

      const hashed = await bcrypt.hash(String(b.password), 10);
      rows.push({
        email: b.email,
        first_name: b.first_name,
        last_name: b.last_name,
        mobile_number: String(b.mobile_number),
        user_name: b.user_name,
        gender: b.gender,
        password: hashed,
        is_admin: !!b.is_admin,
        is_email_verify: !!b.is_email_verify,
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      });
    }

    const created = await User.bulkCreate(rows, { validate: true });
    return res.status(200).json({ status: "true", count: created.length, data: created });
  } catch (e) {
    return res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /users
 * Filters: q, business_id, branch_id, role_id
 * Pagination: page, limit
 */
exports.list = async (req, res) => {
  try {
    const { q, business_id, branch_id, role_id, page = 1, limit = 50 } = req.query;

    const where = {};
    if (q) {
      const term = String(q).trim();
      where[Op.or] = [
        { first_name: { [Op.like]: `%${term}%` } },
        { last_name:  { [Op.like]: `%${term}%` } },
        { user_name:  { [Op.like]: `%${term}%` } },
        { email:      { [Op.like]: `%${term}%` } },
        { mobile_number: { [Op.like]: `%${term}%` } },
      ];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Math.min(Number(limit) || 50, 200));

    const filteredByMembership = business_id || branch_id || role_id;
    const { rows, count } = await User.findAndCountAll({
      where,
      include: [includeMemberships(!!filteredByMembership, { business_id, branch_id, role_id })],
      limit: lim,
      offset: (pg - 1) * lim,
      order: [["id", "DESC"]],
      distinct: true, // ensures correct count with joins
    });

    res.json({
      status: "true",
      total: count,
      page: pg,
      pages: Math.ceil(count / lim),
      data: rows,
    });
  } catch (e) {
    console.log(e);

    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /users/:id
 */
exports.get = async (req, res) => {
  try {
    const userID =  req.user?.id || req.params.id;
    const user = await User.findByPk(userID, {
      include: [includeMemberships(false, {}, { withPermissions: true })],
    });

    if (!user) return res.status(404).json({ status: "false", message: "User not found" });

    // add a grouped view per membership (keeps raw permissions too)
    const data = user.toJSON();
    if (Array.isArray(data.memberships)) {
      data.memberships = data.memberships.map((m) => {
        const perms = m?.role?.permissions || [];
        return {
          ...m,
          role_permission_matrix: groupPerms(perms),
        };
      });
    }

    res.json({ status: "true", data });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

// ⬇️ OPTIONAL: memberships-only with permissions
// GET /users/:id/memberships/detailed
// Make sure these are imported from your models index:
// const { UserBranchRole, Business, Branch, Role, Permission } = require("../models");

// Helper from earlier in your controller
function groupPerms(perms = []) {
  const map = new Map();
  for (const p of perms) {
    if (!map.has(p.module)) map.set(p.module, new Set());
    map.get(p.module).add(p.action);
  }
  return Array.from(map.entries()).map(([module, actions]) => ({
    module,
    actions: Array.from(actions).sort(),
  }));
}

exports.membershipsDetailed = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const rows = await UserBranchRole.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "type", "city", "business_id"],
          include: [
            { model: Business, as: "business", attributes: ["id", "name"] }, // ← derive business via branch
          ],
        },
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "description", "branch_id"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["id", "module", "action"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    const data = rows.map((m) => {
      const json = m.toJSON();
      const perms = json.role?.permissions || [];
      const business = json.branch?.business || null; // ← pulled from nested include

      return {
        id: json.id,
        user_id: json.user_id,
        branch_id: json.branch_id,
        role_id: json.role_id,
        // keep originals
        branch: json.branch && {
          id: json.branch.id,
          name: json.branch.name,
          type: json.branch.type,
          city: json.branch.city,
          business_id: json.branch.business_id,
        },
        business, // { id, name } derived via branch.business
        role: json.role && {
          id: json.role.id,
          name: json.role.name,
          description: json.role.description,
          business_id: json.role.business_id,
          branch_id: json.role.branch_id,
          permissions: perms,
        },
        role_permission_matrix: groupPerms(perms),
      };
    });

    res.json({ status: "true", data });
  } catch (e) {
    console.error("membershipsDetailed error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /users/:id
 * (password change has a separate endpoint)
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = normalizeUserBody(req.body);

    // Prevent password update here
    delete b.password;

    const dupMsg = await uniquenessChecks(
      { email: b.email, user_name: b.user_name, mobile_number: b.mobile_number },
      id
    );
    if (dupMsg) return res.status(400).json({ status: "false", message: dupMsg });

    const [n] = await User.update(
      {
        email: b.email,
        first_name: b.first_name,
        last_name: b.last_name,
        mobile_number: b.mobile_number && String(b.mobile_number),
        user_name: b.user_name,
        gender: b.gender,
        is_admin: typeof b.is_admin === "boolean" ? b.is_admin : undefined,
        is_email_verify: typeof b.is_email_verify === "boolean" ? b.is_email_verify : undefined,
        updated_by: req.user?.id || null,
      },
      { where: { id } }
    );

    if (!n) return res.status(404).json({ status: "false", message: "User not found" });

    const user = await User.findByPk(id, { include: [includeMemberships(false)] });
    res.json({ status: "true", data: user });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * POST /users/:id/password
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password, password_confirmation } = req.body || {};
    if (!password || !password_confirmation) {
      return res.status(400).json({ status: "false", message: "password and password_confirmation are required" });
    }
    if (password !== password_confirmation) {
      return res.status(400).json({ status: "false", message: "Passwords do not match" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ status: "false", message: "Password must be at least 6 characters long" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ status: "false", message: "User not found" });

    user.password = await bcrypt.hash(String(password), 10);
    user.updated_by = req.user?.id || null;
    await user.save();

    res.json({ status: "true", message: "Password updated" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /users/:id
 */
exports.remove = async (req, res) => {
  try {
    const n = await User.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ status: "false", message: "User not found" });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /users/bulk
 * Body: { ids: [] }
 */
exports.bulkRemove = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ status: "false", message: "ids[] required" });
    const n = await User.destroy({ where: { id: ids } });
    res.json({ status: "true", deleted: n });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /users/bulk
 * Array of { id, ...fields } (no password here)
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : [];
    let updated = 0;

    for (const raw of arr) {
      const id = Number(raw.id);
      if (!id) continue;
      const b = normalizeUserBody(raw);

      // no password here
      delete b.password;

      const dupMsg = await uniquenessChecks(
        { email: b.email, user_name: b.user_name, mobile_number: b.mobile_number },
        id
      );
      if (dupMsg) return res.status(400).json({ status: "false", message: dupMsg, id });

      const [n] = await User.update(
        {
          email: b.email,
          first_name: b.first_name,
          last_name: b.last_name,
          mobile_number: b.mobile_number && String(b.mobile_number),
          user_name: b.user_name,
          gender: b.gender,
          is_admin: typeof b.is_admin === "boolean" ? b.is_admin : undefined,
          is_email_verify: typeof b.is_email_verify === "boolean" ? b.is_email_verify : undefined,
          updated_by: req.user?.id || null,
        },
        { where: { id } }
      );
      updated += n;
    }

    res.json({ status: "true", updated });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /users/:id/memberships
 * Convenience endpoint to list a user's memberships
 */
exports.memberships = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const rows = await UserBranchRole.findAll({
      where: { user_id: userId },
      include: [
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },
        { model: Role, as: "role", attributes: ["id", "name", "description", "business_id", "branch_id"] },
      ],
      order: [["id", "DESC"]],
    });
    res.json({ status: "true", data: rows });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /users/check
 * Duplicate checks: ?email=&user_name=&mobile_number=
 */
exports.check = async (req, res) => {
  try {
    const msg = await uniquenessChecks({
      email: req.query.email,
      user_name: req.query.user_name,
      mobile_number: req.query.mobile_number,
    });
    if (msg) return res.status(409).json({ status: "false", message: msg });
    res.json({ status: "true", message: "OK" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
/**
 * PATCH /users/:id
 * Partially update a user's fields.
 */
exports.patch = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = normalizeUserBody(req.body);
    console.log(req.body)
    // Prevent password update here
    delete b.password;

    // Filter out undefined values from the body to only update provided fields
    const fieldsToUpdate = {};
    for (const key in b) {
      if (b[key] !== undefined) {
        fieldsToUpdate[key] = b[key];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ status: "false", message: "No fields provided for update" });
    }

    // Perform uniqueness checks only for fields that are being updated
    const uniquenessCheckData = {};
    if (fieldsToUpdate.email) uniquenessCheckData.email = fieldsToUpdate.email;
    if (fieldsToUpdate.user_name) uniquenessCheckData.user_name = fieldsToUpdate.user_name;
    if (fieldsToUpdate.mobile_number) uniquenessCheckData.mobile_number = fieldsToUpdate.mobile_number;

    const dupMsg = await checkUserUniqueness(uniquenessCheckData, id);
    if (dupMsg) return res.status(400).json({ status: "false", message: dupMsg });

    // Handle specific type conversions if necessary for patch
    if (fieldsToUpdate.mobile_number) {
      fieldsToUpdate.mobile_number = String(fieldsToUpdate.mobile_number);
    }
    if (typeof fieldsToUpdate.is_admin !== "undefined") {
      fieldsToUpdate.is_admin = !!fieldsToUpdate.is_admin;
    }
    if (typeof fieldsToUpdate.is_email_verify !== "undefined") {
      fieldsToUpdate.is_email_verify = !!fieldsToUpdate.is_email_verify;
    }

    fieldsToUpdate.updated_by = req.user?.id || null;
    console.log(fieldsToUpdate);
    const [n] = await User.update(fieldsToUpdate, { where: { id } });

    if (!n) return res.status(404).json({ status: "false", message: "User not found" });

    const user = await User.findByPk(id, { include: [includeMemberships(false)] });
    res.json({ status: "true", data: user });
  } catch (e) {
    console.log(e);
    res.status(400).json({ status: "false", message: e.message });
  }
};