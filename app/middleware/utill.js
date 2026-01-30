const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Op } = require("sequelize");
const { UserBranchRole, Role, Permission, Branch, Business, User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET

// Main middleware
async function isPermission(req, res, next) {
  try {
    // sanity
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    const methodMap = { GET: "view", POST: "create", PUT: "update", PATCH: "update", DELETE: "delete" };
    const action = (methodMap[req.method] || "access").toString().toLowerCase();
      
    // Resolve module name
    const headerModule = req.headers["x-permission-module"] || req.query?.permission_module || req.body?.permission_module;
    let moduleName = headerModule;
    if (!moduleName) {
      const segments = String(req.baseUrl).split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      moduleName = lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "";
    }

    if (!moduleName) {
      return res.status(400).json({ status: "false", message: "Unable to infer permission module" });
    }

    // Resolve scope (branchId/businessId)
    const branchId =
      Number(req.headers["x-branch-id"]) ||
      Number(req.body?.branch_id) ||
      Number(req.query?.branch_id) ||
      Number(req.params.branch_id) ||
      null;

    const businessId =
      Number(req.headers["x-business-id"]) ||
      Number(req.body?.business_id) ||
      Number(req.query?.business_id) ||
      Number(req.params.business_id) ||
      null;


    // 🔑 1. FETCH USER AND MEMBERSHIPS (REQUIRED)
    // This query now also fetches the is_admin flag.
    const items = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserBranchRole,
          as: "memberships",
          include: [
            {
              model: Role,
              as: "role",
              include: [
                { model: Permission, as: "permissions", attributes: ["id", "module", "action"] },
              ],
              attributes: ["id", "name", "description"],
            },
            {
              model: Branch,
              as: "branch",
              include: [{ model: Business, as: "business", attributes: ["id", "name"] }],
              attributes: ["id", "name", "business_id"],
            },
          ],
        },
      ],
      // 🔑 Ensure is_admin is selected in the main query output
      attributes: ['id', 'is_admin'],
    });

    if (!items) {
      return res.status(404).json({ status: "false", message: "User not found" });
    }

    // 🔑 2. ADMIN BYPASS (Using verified database data)
    if (items.is_admin) return next();


    // 3. PROCEED TO PERMISSION CHECK (If not Admin)
    let memberships = items.memberships || [];

    if (!Array.isArray(memberships) || memberships.length === 0) {
      return res.status(403).json({ status: "false", message: "Access denied (no memberships)" });
    }

    // Helper to test permission within a role object
    const roleHasPermission = (roleObj) => {
      if (!roleObj) return false;
      // permissions can be array of objects {module,action}
      const perms = roleObj.permissions || roleObj.Permissions || [];
      for (const p of perms) {
        const pm = (p.module || "").toString();
        const pa = (p.action || "").toString().toLowerCase();
        if (pm === moduleName && pa === action) return true;
      }
      return false;
    };

    // First: check scoped memberships if branchId or businessId present
    if (branchId || businessId) {
      // check memberships that match scope
      const scoped = memberships.filter((m) => {
        const b = m.branch || {};
        const bId = Number(b.id || m.branch_id);
        const bizId = Number((b && b.business && b.business.id) || b.business_id);
        if (branchId && Number(m.branch_id) === Number(branchId)) return true;
        if (businessId && Number(bizId) === Number(businessId)) return true;
        return false;
      });

      for (const m of scoped) {
        if (roleHasPermission(m.role)) {
          return next();
        }
      }

      // strict scoping: DO NOT fallback to other memberships
      return res.status(403).json({ status: "false", message: `Access denied for ${moduleName} (strict scope)` });
    }

    // No explicit scope provided => allow if any membership has permission
    for (const m of memberships) {
      if (roleHasPermission(m.role)) return next();
    }

    // nothing matched -> deny
    return res.status(403).json({ status: "false", message: `Access denied for ${moduleName}` });
  } catch (err) {
    console.error("isPermission error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ status: "false", message: "Internal Server Error" });
  }
}

const contextValidator = async (req, res, next) => {
  try {
    const { business_id, branch_id } = req.params;

    if (!business_id || !branch_id) {
      return res.status(400).json({
        status: false,
        message: "Business ID and Branch ID are required",
      });
    }

    // Admin → full access
    if (req.user.isAdmin === true) {
      req.context = {
        business_id: Number(business_id),
        branch_id: Number(branch_id),
      };
      return next();
    }

    // Validate user access to branch + business
    const access = await UserBranchRole.findOne({
      where: {
        user_id: req.user.id,
        branch_id,
      },
      include: [
        {
          model: Branch,
          as: "branch",
          where: { business_id },
        },
      ],
    });

    if (!access) {
      return res.status(403).json({
        status: false,
        message: "Access denied for this branch",
      });
    }

    req.context = {
      business_id: Number(business_id),
      branch_id: Number(branch_id),
    };

    next();
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Generate JWT
const getToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.is_admin || false,
        isSeller: user.is_seller || false,
      },
      JWT_SECRET,
      {
        expiresIn: "277h",
      }
    );
  } catch (error) {
    console.error("❌ Token generation error:", error);
  }
};

const isAuth = (req, res, next) => {
  try {
    // Try both: "Authorization: Bearer <token>" OR "x-auth-token: <token>"
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // remove "Bearer "
    } else if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token is not supplied or malformed." });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid Token" });
      }

      // Attach decoded payload to request
      req.user = decoded; // { id, isAdmin, isSeller, ... }

      next();
    });
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

// Role middlewares
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: "Admin Token is not valid..." });
};

const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    return next();
  }
  return res.status(401).send({ message: "Invalid Seller Token" });
};

const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    return next();
  }
  return res.status(401).send({ message: "Invalid Admin/Seller Token" });
};

module.exports = {
  getToken,
  isAuth,
  isAdmin,
  isSeller,
  isSellerOrAdmin,
  isPermission,
  contextValidator
};