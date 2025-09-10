// app/controller/role.controller.js
// CommonJS + unified responses { status: "true"/"false", ... }

const { Op } = require("sequelize");
const Role = require("../models/role.js");
const Branch = require("../models/branch.js");
const Business = require("../models/business.js"); // for business-wise list
const User = require("../models/user.js");
const UserBranchRole = require("../models/UserBranchRole.js"); // for user-wise list (adjust path if needed)

const sequelize = require("../models").sequelize;
// const { Role, UserBranchRole, Branch: BranchModel } = db;
const { ROLE } = require("../constants/constant");
const e = require("express");
// If you have a constants file, use it; fallback to a safe default
async function ensureRoleOnBranch({ branchId, roleName, userId, t }) {
  const [role] = await Role.findOrCreate({
    where: { branch_id: branchId, name: roleName },
    defaults: {
      branch_id: branchId,
      name: roleName,
      created_by: userId || null,
      updated_by: userId || null,
    },
    transaction: t,
  });
  return role;
}

async function getBranchIdsForBusiness(businessId, t) {
  const rows = await Branch.findAll({
    where: { business_id: businessId },
    attributes: ["id"],
    transaction: t,
  });
  console.log(rows.map(r => r))
  return rows.map(r => r.id);
}


async function findUserRoleNameInBusiness({ userId, businessId, t }) {
  // All branches under the business
    const branchIds = await getBranchIdsForBusiness(businessId, t);
    if (!branchIds.length) return null;
    // console.log(branchIds);
    const links = await UserBranchRole.findAll({
      where: {
        user_id: userId,
        branch_id: { [Op.in]: branchIds },
      },
      attributes: ["id", "role_id", "branch_id"],
      order: [
        ["id", "DESC"], // robust even if you don't have createdAt
      ],
      transaction: t,
    });
    if (!links.length) return null;
  
    const chosen = links[0];
    const role = await Role.findByPk(chosen.role_id, {
      attributes: ["name"],
      transaction: t,
    });
    return role?.name || null;
  }

exports.list = async (req, res) => {
  try {
    const items = await Branch.findAll({ order: [["id", "DESC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.get = async (req, res) => {
  try {
    const item = await Branch.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Branch not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const {
      name, email, contact_number, type,
      address_1, landmark, city, state, country, pincode,
      business_id
    } = req.body;

    // Basic validation
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }
    if (!business_id) {
      await t.rollback();
      return res.status(400).json({ status: "false", message: "business_id is required" });
    }
    if (!name || !address_1 || !city || !state || !country || !pincode) {
      await t.rollback();
      return res.status(400).json({
        status: "false",
        message: "Branch requires name, address_1, city, state, country, pincode",
      });
    }

    // Ensure business exists
    const biz = await Business.findByPk(business_id, { transaction: t });
    if (!biz) {
      await t.rollback();
      return res.status(404).json({ status: "false", message: "Business not found" });
    }

    // Create the branch
    const branch = await Branch.create({
      name,
      email,
      contact_number,
      type,
      address_1,
      landmark,
      city,
      state,
      country,
      pincode,
      business_id,
      created_by: userId,
      updated_by: userId,
    }, { transaction: t });

    // ---------------------------
    // Role assignment section
    // ---------------------------

    // 1) Resolve system super admin (prefer id=1; else first is_admin=true)
    let sysAdminId = 1;
    const sysAdminById1 = await User.findOne({
      where: { id: 1, is_admin: true },
      attributes: ["id"],
      transaction: t,
    });
    if (!sysAdminById1) {
      const anySysAdmin = await User.findOne({
        where: { is_admin: true },
        attributes: ["id"],
        order: [["id", "ASC"]],
        transaction: t,
      });
      if (anySysAdmin?.id) sysAdminId = anySysAdmin.id;
    }

    // 2) Ensure SUPER_ADMIN role exists on this branch and attach system super admin
    const superAdminRole = await ensureRoleOnBranch({
      branchId: branch.id,
      roleName: ROLE.SUPER_ADMIN || "Super Admin",
      userId,
      t,
    });

    const [sysadminLink] = await UserBranchRole.findOrCreate({
      where: { user_id: sysAdminId, branch_id: branch.id, role_id: superAdminRole.id },
      defaults: {
        user_id: sysAdminId,
        branch_id: branch.id,
        role_id: superAdminRole.id,
      },
      transaction: t,
    });

    // 3) Creator role: reuse prior role in this business; else ADMIN
    let creatorRoleName = ROLE.ADMIN || "Admin";
    const priorRoleName = await findUserRoleNameInBusiness({
      userId,
      businessId: business_id,
      t,
    });
    if (priorRoleName) creatorRoleName = priorRoleName;

    let creatorAssigned = null;
    if (userId !== sysAdminId) {
      const creatorRole = await ensureRoleOnBranch({
        branchId: branch.id,
        roleName: creatorRoleName,
        userId,
        t,
      });

      const [creatorLink] = await UserBranchRole.findOrCreate({
        where: { user_id: userId, branch_id: branch.id, role_id: creatorRole.id },
        defaults: {
          user_id: userId,
          branch_id: branch.id,
          role_id: creatorRole.id,
        },
        transaction: t,
      });

      creatorAssigned = {
        user_id: userId,
        role_id: creatorRole.id,
        role_name: creatorRoleName,
        link_id: creatorLink.id,
      };
    }

    await t.commit();

    return res.status(200).json({
      status: "true",
      data: {
        branch,
        assigned_roles: {
          sysadmin: {
            user_id: sysAdminId,
            role_id: superAdminRole.id,
            role_name: ROLE.SUPER_ADMIN || "Super Admin",
            link_id: sysadminLink.id,
          },
          creator: creatorAssigned, // null if creator === sysadmin
        },
      },
    });
  } catch (e) {
    // safe rollback if still open
    try {
      if (t && t.finished !== "commit" && t.finished !== "rollback") {
        await t.rollback();
      }
    } catch (_) {}

    console.error("❌ Branch create error:", e);
    if (e.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        status: "false",
        message: "Foreign key error: ensure referenced ids exist",
      });
    }
    return res.status(400).json({ status: "false", message: e.message });
  }
};

exports.listByBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await Branch.findAll({
      where: { business_id: id },
      order: [["id", "DESC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.update = async (req, res) => {
  try {
    const item = await Branch.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Branch Not found" });
    await item.update(req.body);
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const count = await Branch.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ status: "false", message: "Branch not found" });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};