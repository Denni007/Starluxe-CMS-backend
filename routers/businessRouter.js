import express from "express";
import { Op } from "sequelize";
import Business from "../models/businessModel.js";
import Branch from "../models/branchModel.js";
import {isAuth} from "../middleware/utill.js";

const router = express.Router();

/**
 * Helpers
 */
function pickBusinessFields(body = {}) {
  // Accept camelCase from frontend; your Sequelize model can map fields via `field` config
  return {
    name: body.name,
    industry_id: body.industryId ?? body.industry_id,
    pan: body.pan,
    website: body.website,
    primary_email: body.primaryEmail ?? body.primary_email,
    contact_number: body.primaryContact ?? body.contact_number,
  };
}

/**
 * GET /businesses
 * Optional query: ?q=<search>
 */
router.get("/", isAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { website: { [Op.iLike]: `%${q}%` } },
            { primary_email: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : {};

    const businesses = await Business.findAll({
      where,
      order: [["name", "ASC"]],
      include: [{ model: Branch, as: "branches" }],
    });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /users/me/businesses
 */
router.get("/users/me", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const businesses = await Business.findAll({
      where: { created_by: userId },
      order: [["name", "ASC"]],
      include: [{ model: Branch, as: "branches" }],
    });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * POST /businesses
 * Supports single or bulk create
 */
router.post("/", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.body)

    if (Array.isArray(req.body)) {
      const payloads = req.body.map((b) => ({
        ...pickBusinessFields(b),
        created_by: userId,
        updated_by: userId,
      }));
      const businesses = await Business.bulkCreate(payloads, { validate: true });
      return res.status(201).json(businesses);
    }

    const payload = {
      ...pickBusinessFields(req.body),
      created_by: userId,
      updated_by: userId,
    };

    const business = await Business.create(payload);
    res.status(201).json(business);
  } catch (err) {
    console.error("❌ Error creating businesses:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /businesses/:id
 */
router.get("/:id", isAuth, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [{ model: Branch, as: "branches" }],
    });
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /businesses/:id
 */
router.put("/:id", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const updates = pickBusinessFields(req.body);
    Object.assign(business, updates, { updated_by: userId });

    await business.save();
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /businesses/:id
 */
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    await business.destroy();
    res.json({ message: "Business deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
