// app/middleware/checkPermission.js
const { UserBranchRole, Role, Permission } = require("../models");

/**
 * Helper: collect all permissions a user has in a given branch
 * @param {number} userId
 * @param {number} branchId
 * @returns {Promise<Set<string>>} e.g. Set(["Leads:create","Leads:view"])
 */
async function getUserPermissionsForBranch(userId, branchId) {
  const memberships = await UserBranchRole.findAll({
    where: { user_id: userId, branch_id: branchId },
    include: [
      {
        model: Role,
        as: "role",
        include: [
          { model: Permission, as: "permissions", attributes: ["module", "action"] }
        ],
      },
    ],
  });

  const permSet = new Set();
  for (const m of memberships) {
    const perms = m.role?.permissions || [];
    for (const p of perms) {
      permSet.add(`${p.module}:${p.action}`);
    }
  }
  return permSet;
}

/**
 * Middleware factory: enforce a specific permission
 * Usage: router.post("/lead", checkPermission("Leads","create"), handler)
 */
function checkPermission(moduleName, action) {
  return async function (req, res, next) {
    try {
      const userId = req.user?.id; // set earlier by JWT auth
      const branchId = req.params.branchId || req.query.branchId || req.headers["x-branch-id"];

      if (!userId || !branchId) {
        return res.status(400).json({ message: "Missing user or branch context" });
      }

      const perms = await getUserPermissionsForBranch(userId, Number(branchId));
      const code = `${moduleName}:${action}`;

      if (!perms.has(code)) {
        return res.status(403).json({ message: "Forbidden: missing permission", required: code });
      }

      next();
    } catch (err) {
      console.error("checkPermission error:", err);
      res.status(400).json({ message: "Server error" });
    }
  };
}

module.exports = { checkPermission, getUserPermissionsForBranch };
