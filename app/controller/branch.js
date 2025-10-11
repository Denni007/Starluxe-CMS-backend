const { Op } = require("sequelize");
const { RolePermission, Permission, UserBranchRole, Role, Branch, Business, User } = require("../models");

const sequelize = require("../models").sequelize;
const { ROLE } = require("../constants/constant");

async function ensureRoleOnBranch({ branchId, roleName, userId, t }) {
  const [role, created] = await Role.findOrCreate({
    where: { branch_id: branchId, name: roleName },
    defaults: {
      branch_id: branchId,
      name: roleName,
      created_by: userId || null,
      updated_by: userId || null,
    },
    transaction: t,
  });

  if (created) {
    const defaultPerms = await Permission.findAll({
      attributes: ["id"],
      transaction: t,
    });

    if (defaultPerms.length) {
      const rolePerms = defaultPerms.map(p => ({
        role_id: role.id,
        permission_id: p.id,
        created_by: userId || null,
        updated_by: userId || null,
      }));
      await RolePermission.bulkCreate(rolePerms, { transaction: t });
    }
  }

  return role;
}

async function getBranchIdsForBusiness(businessId, t) {
  const rows = await Branch.findAll({
    where: { business_id: businessId },
    attributes: ["id"],
    transaction: t,
  });

  return rows.map(r => r.id);
}

async function findUserRoleNameInBusiness({ userId, businessId, t }) {
  const branchIds = await getBranchIdsForBusiness(businessId, t);
  if (!branchIds.length) return null;
  const links = await UserBranchRole.findAll({
    where: {
      user_id: userId,
      branch_id: { [Op.in]: branchIds },
    },
    attributes: ["id", "role_id", "branch_id"],
    order: [
      ["id", "DESC"], 
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

    const biz = await Business.findByPk(business_id, { transaction: t });
    if (!biz) {
      await t.rollback();
      return res.status(404).json({ status: "false", message: "Business not found" });
    }

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
          creator: creatorAssigned,
        },
      },
    });
  } catch (e) {
    try {
      if (t && t.finished !== "commit" && t.finished !== "rollback") {
        await t.rollback();
      }
    } catch (_) { }

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
  const branchId = req.params.id;

  try {
    const result = await sequelize.transaction(async (t) => {


      const branch = await Branch.findByPk(branchId, { transaction: t });
      if (!branch) {
        const err = new Error("Branch not found");
        err.statusCode = 404;
        throw err;
      }

      const roles = await Role.findAll({
        where: { branch_id: branchId },
        transaction: t,
      });
      const roleIds = roles.map((r) => r.id);

      if (roleIds.length) {
        await RolePermission.destroy({
          where: { role_id: roleIds },
          transaction: t,
        });

        await Role.destroy({
          where: { id: roleIds },
          transaction: t,
        });
      }

      await UserBranchRole.destroy({
        where: { branch_id: branchId },
        transaction: t,
      });


      await branch.destroy({ transaction: t });

      return { deleted: true };
    });

    return res.json({ status: "true", message: "Branch and related data removed", ...result });
  } catch (e) {
    console.error("❌ branch.remove error:", e);
    const code = e.statusCode || 400;
    return res.status(code).json({ status: "false", message: e.message });
  }
};