import express from "express";
import Industry from "../models/industryModel.js";
import IsAuth from "../middleware/auth.js";

const router = express.Router();

// 🔹 Get all industries
router.get("/", async (req, res) => {
  try {
    const industries = await Industry.findAll({
      order: [["name", "ASC"]],
    });
    res.json(industries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add new industry
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    let industries;

    if (Array.isArray(payload)) {
      // Multiple industries
      industries = await Industry.bulkCreate(payload, { validate: true });
    } else {
      // Single industry
      industries = await Industry.create(payload);
    }

    res.status(201).json(industries);
  } catch (err) {
    console.error("❌ Error creating industries:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 🔹 Get industry by ID
router.get("/:id", async (req, res) => {
  try {
    const industry = await Industry.findByPk(req.params.id);
    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }
    res.json(industry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update industry
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const industry = await Industry.findByPk(req.params.id);

    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    industry.name = name || industry.name;
    await industry.save();

    res.json(industry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete industry
router.delete("/:id", async (req, res) => {
  try {
    const industry = await Industry.findByPk(req.params.id);

    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    await industry.destroy();
    res.json({ message: "Industry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
