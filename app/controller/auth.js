const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Branch, Business, Role, User, Permission, UserBranchRole} = require("../models");
const { getToken } = require("../middleware/utill");

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

    return res.json({ status: "true", message: "User created successfully" });
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

// POST /login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body; // "email" can be username too

    if (!email || !password) {
      return res.status(400).json({
        status: "false",
        message: "email/username and password are required",
      });
    }

    // Normalize: treat as email if it looks like one; otherwise as username
    const looksLikeEmail = /\S+@\S+\.\S+/.test(email);
    const whereClause = looksLikeEmail
      ? { email: email.trim().toLowerCase() }
      : { user_name: email.trim() };

    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(404).json({ status: "false", message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: "false", message: "Invalid password" });
    }

    // Pull memberships: user ↔ branch ↔ role (+ branch → business)
    const memberships = await UserBranchRole.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
          include: [{ model: Permission, as: "permissions", attributes: ["module", "action"] }],
        },
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "type", "city", "business_id"],
          include: [{ model: Business, as: "business", attributes: ["id", "name"] }],
        },
      ],
      order: [["id", "ASC"]],
    });

    // Build branch-scoped memberships and effective permissions
    const membershipPayload = memberships.map((m) => {
      const business_id = m.branch?.business?.id ?? m.branch?.business_id ?? null;
      const business_name = m.branch?.business?.name ?? null;
      const rolePerms = (m.role?.permissions || []).map((p) => `${p.module}:${p.action}`);
      return {
        business_id,
        business_name,
        branchId: m.branch?.id ?? m.branch_id,
        branchName: m.branch?.name ?? null,
        roleId: m.role?.id ?? m.role_id,
        roleName: m.role?.name ?? null,
        permissions: Array.from(new Set(rolePerms)), // unique list for the role
        isPrimary: !!m.is_primary,
      };
    });

    // Optionally, group permissions per branch for quicker frontend gating
    const permissionsByBranch = {};
    for (const m of membershipPayload) {
      const bId = m.branchId;
      if (!bId) continue;
      if (!permissionsByBranch[bId]) permissionsByBranch[bId] = new Set();
      for (const code of m.permissions) permissionsByBranch[bId].add(code);
    }
    // Convert Set → array for JSON
    Object.keys(permissionsByBranch).forEach(
      (k) => (permissionsByBranch[k] = Array.from(permissionsByBranch[k]))
    );

    // JWT
    const token = getToken(user); // returns null if JWT_SECRET misconfigured
    if (!token) {
      return res.status(400).json({ status: "false", message: "Token generation failed" });
    }

    return res.json({
      status: "true",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
          is_admin: !!user.is_admin,
          memberships: membershipPayload,
          permissionsByBranch, // { [branchId]: ["Leads:view", "Leads:create", ...] }
        },
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(400).json({ status: "false", message: "Server error" });
  }
};
