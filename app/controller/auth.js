const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Branch, Business, Role, User, Permission, UserBranchRole} = require("../models");
const { getToken } = require("../middleware/utill");
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

// POST /signup
exports.signup = async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      mobile_number,
      password,
      password_confirmation,
      user_name,
      gender,
    } = req.body;

    if (
      !email ||
      !first_name ||
      !last_name ||
      !mobile_number ||
      !user_name ||
      !gender ||
      !password ||
      !password_confirmation
    ) {
      return res.status(400).json({ status: "false", message: "All fields are required" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ status: "false", message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ status: "false", message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      first_name,
      last_name,
      mobile_number,
      password: hashedPassword,
      user_name,
      gender,
    });

    return res.json({ status: "true", message: "User created successfully. Id will actived post admin approval" });
  } catch (err) {
    console.error("❌ Error creating user:", err);

    if (err.name === "SequelizeUniqueConstraintError" && err.errors?.[0]) {
      const field = err.errors[0].path;
      let message = "Duplicate value";

      if (field === "email") message = "Email already exists";
      if (field === "user_name") message = "Username already taken";
      if (field === "mobile_number") message = "Mobile number already registered";

      return res.status(400).json({ status: "false", message });
    }

    if (err.name === "SequelizeValidationError" && err.errors?.[0]) {
      return res.status(400).json({ status: "false", message: err.errors[0].message });
    }

    return res.status(400).json({ status: "false", message: "Something went wrong" });
  }
};
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "false", message: "email/username and password are required" });
    }

    // email OR username
    const looksLikeEmail = /\S+@\S+\.\S+/.test(email);
    const where = looksLikeEmail ? { email: email.trim().toLowerCase() } : { user_name: email.trim() };

    // find with password
    const user = await User.findOne({ where });
    if (!user) return res.status(404).json({ status: "false", message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ status: "false", message: "Invalid password" });
    if (!user.is_active) return res.status(401).json({ status: "false", message: "User is not actived" });

    // NOW fetch full graph using the SAME helper as `get`
    const userFull = await User.findByPk(user.id, {
      include: [includeMemberships(false, {}, { withPermissions: true })],
    });
    if (!userFull) return res.status(404).json({ status: "false", message: "User not found" });

    // mirror `get` shaping
    const data = userFull.toJSON();
    if (Array.isArray(data.memberships)) {
      data.memberships = data.memberships.map((m) => {
        const perms = m?.role?.permissions || [];
        return {
          ...m,
          role_permission_matrix: groupPerms(perms),
        };
      });
    }

    const token = getToken(userFull);
    if (!token) return res.status(400).json({ status: "false", message: "Token generation failed" });

    return res.json({
      status: "true",
      message: "Login successful",
      data: {
        token,
        ...data, // EXACT same shape as `get`, plus you now have the token
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(400).json({ status: "false", message: "Server error" });
  }
};
// // POST /login
// exports.login = async (req, res) => {
//   try {
//     let { email, password } = req.body; // "email" can be username too

//     if (!email || !password) {
//       return res.status(400).json({
//         status: "false",
//         message: "email/username and password are required",
//       });
//     }

//     // Normalize: treat as email if it looks like one; otherwise as username
//     const looksLikeEmail = /\S+@\S+\.\S+/.test(email);
//     const whereClause = looksLikeEmail
//       ? { email: email.trim().toLowerCase() }
//       : { user_name: email.trim() };

//     const user = await User.findOne({ where: whereClause });
    
//     if (!user) {
//       return res.status(404).json({ status: "false", message: "User not found" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ status: "false", message: "Invalid password" });
//     }
//     if(!user.is_active){
//       return res.status(401).json({ status: "false", message: "User is not actived" });
//     }
//     // Pull memberships: user ↔ branch ↔ role (+ branch → business)
//     const memberships = await UserBranchRole.findAll({
//       where: { user_id: user.id },
//       include: [
//         {
//           model: Role,
//           as: "role",
//           attributes: ["id", "name"],
//           include: [{ model: Permission, as: "permissions", attributes: ["module", "action"] }],
//         },
//         {
//           model: Branch,
//           as: "branch",
//           attributes: ["id", "name", "type", "city", "business_id"],
//           include: [{ model: Business, as: "business", attributes: ["id", "name"] }],
//         },
//       ],
//       order: [["id", "ASC"]],
//     });

//     // Build branch-scoped memberships and effective permissions
//     const membershipPayload = memberships.map((m) => {
//       const business_id = m.branch?.business?.id ?? m.branch?.business_id ?? null;
//       const business_name = m.branch?.business?.name ?? null;
//       const rolePerms = (m.role?.permissions || []).map((p) => `${p.module}:${p.action}`);
//       return {
//         business_id,
//         business_name,
//         branchId: m.branch?.id ?? m.branch_id,
//         branchName: m.branch?.name ?? null,
//         roleId: m.role?.id ?? m.role_id,
//         roleName: m.role?.name ?? null,
//         permissions: Array.from(new Set(rolePerms)), // unique list for the role
//         isPrimary: !!m.is_primary,
//       };
//     });

//     // Optionally, group permissions per branch for quicker frontend gating
//     const permissionsByBranch = {};
//     for (const m of membershipPayload) {
//       const bId = m.branchId;
//       if (!bId) continue;
//       if (!permissionsByBranch[bId]) permissionsByBranch[bId] = new Set();
//       for (const code of m.permissions) permissionsByBranch[bId].add(code);
//     }
//     // Convert Set → array for JSON
//     Object.keys(permissionsByBranch).forEach(
//       (k) => (permissionsByBranch[k] = Array.from(permissionsByBranch[k]))
//     );

//     // JWT
//     const token = getToken(user); // returns null if JWT_SECRET misconfigured
//     if (!token) {
//       return res.status(400).json({ status: "false", message: "Token generation failed" });
//     }

//     return res.json({
//       status: "true",
//       message: "Login successful",
//       data: {
//         token,
//         user: {
//           id: user.id,
//           email: user.email,
//           user_name: user.user_name,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           mobile_number: user.mobile_number,
//           is_admin: !!user.is_admin,
//           memberships: membershipPayload,
//           permissionsByBranch, // { [branchId]: ["Leads:view", "Leads:create", ...] }
//         },
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     return res.status(400).json({ status: "false", message: "Server error" });
//   }
// };


// exports.get = async (req, res) => {
//   try {
//     const userID =  req.user?.id || req.params.id;
//     const user = await User.findByPk(userID, {
//       include: [includeMemberships(false, {}, { withPermissions: true })],
//     });

//     if (!user) return res.status(404).json({ status: "false", message: "User not found" });

//     // add a grouped view per membership (keeps raw permissions too)
//     const data = user.toJSON();
//     if (Array.isArray(data.memberships)) {
//       data.memberships = data.memberships.map((m) => {
//         const perms = m?.role?.permissions || [];
//         return {
//           ...m,
//           role_permission_matrix: groupPerms(perms),
//         };
//       });
//     }

//     res.json({ status: "true", data });
//   } catch (e) {
//     res.status(400).json({ status: "false", message: e.message });
//   }
// };

// ⬇️ OPTIONAL: memberships-only with permissions
// GET /users/:id/memberships/detailed
// Make sure these are imported from your models index:
// const { UserBranchRole, Business, Branch, Role, Permission } = require("../models");

// Helper from earlier in your controller
