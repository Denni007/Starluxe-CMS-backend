// routes/businessRoutes.js
import express from "express";
import Role from "../models/roleModel.js";
import IsAuth from "../middleware/auth.js";
import Branch from "../models/branchModel.js";

const router = express.Router();

// 🔹 Get all businesses
router.get("/", async (req, res) => {
  try {
    const Branches = await Role.findAll({
      order: [["name", "ASC"]],
    });
    res.json(Branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add new business
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    let branches;

    if (Array.isArray(payload)) {
      // Multiple businesses
      branches = await Role.bulkCreate(payload, { validate: true });
    } else {
      // Single business
      businesses = await Branch.create(payload);
    }

    res.status(201).json(businesses);
  } catch (err) {
    console.error("❌ Error creating businesses:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get business by ID
router.get("/:id", async (req, res) => {
  try {
    const business = await Branch.findByPk(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update business
router.put("/:id", async (req, res) => {
  try {
    const { name, website, email, contact_number, industry_id, updated_by } = req.body;
    const business = await Role.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    business.name = name || business.name;
    business.website = website || business.website;
    business.email = email || business.email;
    business.contact_number = contact_number || business.contact_number;
    business.industry_id = industry_id || business.industry_id;
    business.updated_by = updated_by || business.updated_by;

    await business.save();

    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete business
router.delete("/:id", async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await business.destroy();
    res.json({ message: "Business deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
