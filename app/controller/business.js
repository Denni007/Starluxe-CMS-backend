const Business = require("../models/business");
const Branch = require("../models/branch");
const sequelize = require("../models").sequelize;

exports.createBusinessWithBranch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    // Payload shape options:
    // 1) { business: {...}, branch: {...} }      -> create new business + its branch
    // 2) { business_id: 1, branch: {...} }       -> attach branch to existing business
    const { business, business_id, branch } = req.body || {};

    if (!branch || typeof branch !== "object") {
      await t.rollback();
      return res.status(400).json({ status: "false", message: "branch object is required" });
    }

    let createdBusiness = null;
    let targetBusinessId = business_id ? Number(business_id) : null;

    // Case A: use existing business_id
    if (targetBusinessId) {
      const exists = await Business.findByPk(targetBusinessId, { transaction: t });
      if (!exists) {
        await t.rollback();
        return res.status(404).json({ status: "false", message: `Business ${targetBusinessId} not found` });
      }
      createdBusiness = exists;
    }
    // Case B: create new business from payload
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

    // Create the branch
    const {
      name: brName,
      email: brEmail,
      contact_number: brContact,
      type = "OFFICE",
      address_1,
      landmark,
      city,
      state,
      country,
      pincode,
    } = branch;

    // Minimal required fields for Branch
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

    await t.commit();

    return res.status(200).json({
      status: "true",
      data: {
        business: createdBusiness,
        branch: createdBranch,
      },
    });
  } catch (e) {
    await t.rollback();
    console.error("❌ org setup error:", e);
    // Friendlier FK message
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
    console.log(req.body)

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
    res.json({ status: "true", data: items });
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