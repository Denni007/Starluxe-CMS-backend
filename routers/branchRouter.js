import express from "express";
import Branch from "../models/branchModel.js";
import Business from "../models/businessModel.js";
import {isAuth} from "../middleware/utill.js";

const router = express.Router();

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
 * GET /branches
 * Optional: ?businessId=#
 */

/**
 * Nested: POST /businesses/:businessId/branches
 */
router.post("/businesses/:businessId", isAuth, async (req, res) => {
  try {

    const userId = req.user.id;
    console.log(userId)

    const { businessId } = req.params;
    const business = await Business.findByPk(businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const payload = pickBranchFields({ ...req.body, business_id: businessId });

    const branch = await Branch.create({
      ...payload,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    const { businessId } = req.query;
    const where = businessId ? { business_id: businessId } : {};
    const branches = await Branch.findAll({
      where,
      order: [["name", "ASC"]],
    });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /branches
 * Body must include businessId/business_id
 */
router.post("/", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = pickBranchFields(req.body);

    if (!payload.business_id) {
      return res.status(400).json({ message: "businessId is required" });
    }

    const business = await Business.findByPk(payload.business_id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const branch = await Branch.create({
      ...payload,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Nested: GET /businesses/:businessId/branches
 */
router.get("/businesses/:businessId/branches", isAuth, async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const branches = await Branch.findAll({
      where: { business_id: businessId },
      order: [["name", "ASC"]],
    });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET /branches/:id
 */
router.get("/:id", isAuth, async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /branches/:id
 */
router.put("/:id", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const updates = pickBranchFields(req.body);
    // Prevent moving to another business unless explicitly allowed:
    if (updates.business_id && updates.business_id !== branch.business_id) {
      // You can decide to block this:
      // return res.status(400).json({ message: "Cannot change business_id of a branch" });
      // or allow it; here we allow:
      branch.business_id = updates.business_id;
    }

    Object.assign(branch, updates, { updated_by: userId });
    await branch.save();
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /branches/:id
 */
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    await branch.destroy();
    res.json({ message: "Branch deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
