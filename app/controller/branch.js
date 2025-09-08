// app/controller/role.controller.js
// CommonJS + unified responses { status: "true"/"false", ... }

const { Op } = require("sequelize");
const Role = require("../models/role.js");
const Branch = require("../models/branch.js");
const Business = require("../models/business.js"); // for business-wise list
const User = require("../models/user.js");
const UserBranchRole = require("../models/UserBranchRole.js"); // for user-wise list (adjust path if needed)

/**
 * GET /roles
 * Includes branch info
 */
exports.list = async (req, res) => {
  try {
    const items = await Branch.findAll({ order: [["id", "DESC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

/**
 * GET /roles/:id
 * Includes branch info
 */
exports.get = async (req, res) => {
  try {
    const item = await Role.findByPk(req.params.id, {
      include: [
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },
      ],
    });
    if (!item) return res.status(404).json({ status: "false", message: "Role not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /roles
 * Supports single or bulk create
 * Automatically sets created_by / updated_by from auth user
 */

exports.create = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(req.body);
    const { name, email, contact_number, type, address_1, landmark, city, state, country, pincode, business_id } = req.body;

    if (!business_id) {
      return res.status(400).json({ status: "false", message: "business_id is required" });
    }

    const business = await Business.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ status: "false", message: "Business not found" });
    }

    const item = await Branch.create({
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
    });

    res.status(201).json({ status: "true", data: item });
  } catch (e) {
    console.error("❌ Branch create error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};


/**
 * PUT /roles/:id
 */
exports.update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description, branch_id } = req.body;

    const item = await Role.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Role not found" });

    if (branch_id && branch_id !== item.branch_id) {
      const b = await Branch.findByPk(branch_id);
      if (!b) return res.status(400).json({ status: "false", message: `Branch ${branch_id} not found` });
      item.branch_id = branch_id;
    }

    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.updated_by = userId ?? item.updated_by;

    await item.save();
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /roles/:id
 */
exports.remove = async (req, res) => {
  try {
    const count = await Role.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ status: "false", message: "Role not found" });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /roles  (bulk)
 * Body: { ids: [1,2,3] }
 */
exports.bulkRemove = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ status: "false", message: "ids[] required" });
    const deleted = await Role.destroy({ where: { id: ids } });
    res.json({ status: "true", deleted });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /roles/branch/:branchId
 * List roles for a specific branch
 */
exports.listByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const items = await Role.findAll({
      where: { branch_id: branchId },
      include: [
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },
      ],
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /roles/business/:businessId
 * List roles for a specific business (via branch.business_id)
 */
exports.listByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await Role.findAll({
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "type", "city", "business_id"],
          where: { business_id: businessId },
          required: true,
        },
      ],
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /roles/user/:userId
 * List role memberships for a specific user across businesses/branches
 * Returns the membership rows (role + business + branch info)
 */
exports.listByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user existence (optional)
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ status: "false", message: "User not found" });

    const memberships = await UserBranchRole.findAll({
      where: { user_id: userId },
      include: [
        { model: Role, as: "role", attributes: ["id", "name", "description"] },
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city", "business_id"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
      ],
      order: [[{ model: Role, as: "role" }, "name", "ASC"]],
    });

    // If you only want distinct Roles (not memberships), map/unique them:
    // const roles = Object.values(
    //   memberships.reduce((acc, m) => {
    //     if (m.role) acc[m.role.id] = m.role;
    //     return acc;
    //   }, {})
    // );

    res.json({ status: "true", data: memberships });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};



// GET /:businessId/branches
// Supports ?q=search&limit=20&page=1
exports.listForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { q, limit = 50, page = 1 } = req.query;

    // ensure business exists
    const biz = await Business.findByPk(businessId);
    if (!biz) return res.status(404).json({ status: "false", message: "Business not found" });

    const where = { business_id: businessId };
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { city: { [Op.like]: `%${q}%` } },
        { state: { [Op.like]: `%${q}%` } },
      ];
    }

    const lim = Math.max(1, Math.min(Number(limit) || 50, 200));
    const offset = (Math.max(1, Number(page) || 1) - 1) * lim;

    const { rows, count } = await Branch.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit: lim,
      offset,
    });

    res.json({
      status: "true",
      data: rows,
      meta: { total: count, page: Number(page) || 1, limit: lim },
    });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

// POST /:businessId/branches
// Creates a branch under the given business
exports.createForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    // ensure business exists
    const biz = await Business.findByPk(businessId);
    if (!biz) return res.status(404).json({ status: "false", message: "Business not found" });

    // whitelist allowed fields
    const {
      name,
      type,          // optional if your model has it
      address_1,
      city,
      state,
      country,
      pincode,
    } = req.body;

    if (!name) return res.status(400).json({ status: "false", message: "Branch name is required" });

    // optional: prevent duplicate branch names within same business
    const dup = await Branch.findOne({ where: { business_id: businessId, name } });
    if (dup) return res.status(400).json({ status: "false", message: "Branch name already exists for this business" });

    const created_by = req.user?.id || null;
    const item = await Branch.create({
      business_id: businessId,
      name,
      type: type ?? null,
      address_1: address_1 ?? null,
      city: city ?? null,
      state: state ?? null,
      country: country ?? null,
      pincode: pincode ?? null,
      created_by,
      updated_by: created_by,
    });

    res.status(201).json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};