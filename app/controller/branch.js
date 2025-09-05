const Branch = require("../models/branch");
const Business = require("../models/business");

/**
 * Helpers
 */
function pickBranchFields(body = {}) {
  return {
    name: body.name,
    type: body.type,
    address_1: body.address_1,
    address_2: body.address_2 ?? null,
    city: body.city,
    state: body.state,
    country: body.country,
    pincode: body.pincode,
    gstin: body.gstin,
    // Accept either businessId or business_id
    business_id: body.businessId ?? body.business_id,
  };
}

/**
 * GET /branches  (optional ?businessId=#)
 */
exports.list = async (req, res) => {
  try {
    const { businessId } = req.query;
    const where = businessId ? { business_id: businessId } : {};
    const items = await Branch.findAll({ where, order: [["name", "ASC"]] });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /branches/:id
 */
exports.get = async (req, res) => {
  try {
    const item = await Branch.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Branch not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /branches
 * Body must include businessId/business_id
 */
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id;
    const payload = pickBranchFields(req.body);

    if (!payload.business_id) {
      return res.status(400).json({ status: "false", message: "businessId is required" });
    }

    const business = await Business.findByPk(payload.business_id);
    if (!business) return res.status(404).json({ status: "false", message: "Business not found" });

    const item = await Branch.create({
      ...payload,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * PUT /branches/:id
 */
exports.update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const item = await Branch.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Branch not found" });

    const updates = pickBranchFields(req.body);

    // Optional: allow re-assignment to another business if explicitly provided
    if (updates.business_id && updates.business_id !== item.business_id) {
      const business = await Business.findByPk(updates.business_id);
      if (!business) {
        return res.status(400).json({ status: "false", message: "Target business not found" });
      }
      item.business_id = updates.business_id;
    }

    Object.assign(item, updates, { updated_by: userId });
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /branches/:id
 */
exports.remove = async (req, res) => {
  try {
    const count = await Branch.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ status: "false", message: "Branch not found" });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * Nested: GET /businesses/:businessId/branches
 */
exports.listForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await Branch.findAll({
      where: { business_id: businessId },
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * Nested: POST /businesses/:businessId/branches
 * (Your earlier route was POST /businesses/:businessId; keeping the intent while fixing the path)
 */
exports.createForBusiness = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { businessId } = req.params;

    const business = await Business.findByPk(businessId);
    if (!business) return res.status(404).json({ status: "false", message: "Business not found" });

    const payload = pickBranchFields({ ...req.body, business_id: businessId });

    const item = await Branch.create({
      ...payload,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};
