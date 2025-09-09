// app/controller/role.controller.js
// CommonJS + unified responses { status: "true"/"false", ... }

const { Op } = require("sequelize");
const Role = require("../models/role.js");
const Branch = require("../models/branch.js");
const Business = require("../models/business.js"); // for business-wise list
const User = require("../models/user.js");
const UserBranchRole = require("../models/UserBranchRole.js"); // for user-wise list (adjust path if needed)


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
  try {
    const userId = req.user?.id;
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

    res.status(200).json({ status: "true", data: item });
  } catch (e) {
    console.error("❌ Branch create error:", e);
    res.status(400).json({ status: "false", message: e.message });
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