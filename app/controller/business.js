const { Op } = require("sequelize");

const sequelize = require("../models").sequelize;
const { ROLE } = require("../constants/constant");
const { User, UserBranchRole, Role, Permission, RolePermission, Business, Branch } = require("../models");


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

exports.createBusinessWithBranch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    const { business, business_id, branch } = req.body || {};

    if (!branch || typeof branch !== "object") {
      await t.rollback();
      return res.status(400).json({ status: "false", message: "branch object is required" });
    }

    let createdBusiness = null;
    let targetBusinessId = business_id ? Number(business_id) : null;

    // ----- A) Existing business -----
    if (targetBusinessId) {
      const exists = await Business.findByPk(targetBusinessId, { transaction: t });
      if (!exists) {
        await t.rollback();
        return res.status(404).json({ status: "false", message: `Business ${targetBusinessId} not found` });
      }
      createdBusiness = exists;
    }
    // ----- B) New business -----
    else {
      if (!business || typeof business !== "object") {
        await t.rollback();
        return res.status(400).json({
          status: "false",
          message: "Either business_id or business object must be provided",
        });
      }

      const {
        name,
        pan_number,
        gstin,
        website,
        email,
        contact_number,
        industry_id,
      } = business;

      if (!name || !contact_number || !industry_id) {
        await t.rollback();
        return res.status(400).json({
          status: "false",
          message: "Business requires name, contact_number, industry_id",
        });
      }

      createdBusiness = await Business.create(
        {
          name,
          pan_number,
          gstin,
          website,
          email,
          contact_number,
          industry_id,
          created_by: userId,
          updated_by: userId,
        },
        { transaction: t }
      );
      targetBusinessId = createdBusiness.id;
    }
    // ----- Create branch -----
    const {
      name: brName,
      email: brEmail,
      contact_number: brContact,
      type,
      address_1,
      landmark,
      city,
      state,
      country,
      pincode,
    } = branch;

    if (!brName || !address_1 || !city || !state || !country || !pincode) {
      await t.rollback();
      return res.status(400).json({
        status: "false",
        message: "Branch requires name, address_1, city, state, country, pincode",
      });
    }

    const createdBranch = await Branch.create(
      {
        name: brName,
        email: brEmail,
        contact_number: brContact,
        type,
        address_1,
        landmark,
        city,
        state,
        country,
        pincode,
        business_id: targetBusinessId,
        created_by: userId,
        updated_by: userId,
      },
      { transaction: t }
    );

    // --------------------------------------------------------
    // Role assignment
    // --------------------------------------------------------
    const anySysAdmin = await User.findOne({
      where: { is_admin: true },
      attributes: ["id"],
      order: [["id", "ASC"]],
      transaction: t,
    });
    const sysAdminId = anySysAdmin.id;
    // 1) system super admin (id=1 preferred; else first is_admin=true)


    const superAdminRole = await ensureRoleOnBranch({
      branchId: createdBranch.id,
      roleName: ROLE.SUPER_ADMIN,
      userId,
      t,
    });
    const [sysadminLink] = await UserBranchRole.findOrCreate({
      where: { user_id: sysAdminId, branch_id: createdBranch.id, role_id: superAdminRole.id },
      defaults: {
        user_id: sysAdminId,
        branch_id: createdBranch.id,
        role_id: superAdminRole.id,
      },
      transaction: t,
    });

    let creatorRoleName = ROLE.ADMIN;
    if (business_id) {
      const priorRole = await findUserRoleNameInBusiness({ userId, businessId: targetBusinessId, t });
      if (priorRole) creatorRoleName = priorRole;
    }

    let creatorAssigned = null;
    if (userId !== sysAdminId) {
      const creatorRole = await ensureRoleOnBranch({
        branchId: createdBranch.id,
        roleName: creatorRoleName,
        userId,
        t,
      });
      const [creatorLink] = await UserBranchRole.findOrCreate({
        where: { user_id: userId, branch_id: createdBranch.id, role_id: creatorRole.id },
        defaults: {
          user_id: userId,
          branch_id: createdBranch.id,
          role_id: creatorRole.id,
        },
        transaction: t,
      });
      creatorAssigned = {
        user_id: userId,
        role_id: creatorRole.id,
        role_name: creatorRoleName,
      };
    }

    // 2) creator role: default ADMIN; if creator had prior role in this business, reuse it


    await t.commit();

    return res.status(200).json({
      status: "true",
      data: {
        business: createdBusiness,
        branch: createdBranch,
        assigned_roles: {
          sysadmin: {
            user_id: sysAdminId,
            role_id: superAdminRole.id,
            role_name: ROLE.SUPER_ADMIN,
          },
          creator: creatorAssigned, // null if creator === sysadmin
        },
      },
    });
  } catch (e) {
    // rollback safely only if still open
    try {
      if (t && t.finished !== "commit" && t.finished !== "rollback") {
        await t.rollback();
      }
    } catch (_) { }

    console.error("❌ org setup error:", e);
    if (e.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        status: "false",
        message: "Foreign key error: ensure industry_id and user references exist",
      });
    }
    return res.status(400).json({ status: "false", message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user?.id; // comes from auth middleware

    if (!userId) {
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    const item = await Business.create({
      ...req.body,
      created_by: userId,
      updated_by: userId,
    });

    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("❌ Business create error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await Business.findAll({ order: [["id", "DESC"]] });
    if (!items) {
      return res.status(404).json({ status: "false", message: "Business not found" });
    }
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Business.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "Business not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Business.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Not found" });
    await item.update(req.body);

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const count = await Business.destroy({ where: { id: req.params.id } });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};