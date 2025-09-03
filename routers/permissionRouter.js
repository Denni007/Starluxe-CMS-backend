// routes/permissionRoutes.js
import express from "express";
import Permission from "../models/permissionModel.js";
import { isAuth } from "../middleware/utill.js";

const router = express.Router();

// Get all permissions
router.get("/", isAuth, async (req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [["module", "ASC"]] });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create permission(s)
router.post("/", isAuth, async (req, res) => {
  try {
    const payload = req.body;
    let permissions;
    console.log("hello"+req.body)
    if (Array.isArray(payload)) {
      permissions = await Permission.bulkCreate(payload, { validate: true });
    } else {
      permissions = await Permission.create(payload);
    }

    res.status(201).json(permissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
