// routes/roleRoutes.js
import express from "express";
import Role from "../models/roleModel.js";
import Branch from "../models/branchModel.js";
import { isAuth } from "../middleware/utill.js";

const router = express.Router();

// 🔹 Get all roles with branch info
router.get("/", isAuth, async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Branch, attributes: ["id", "name", "type", "city"] }],
      order: [["name", "ASC"]],
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create role(s) (with branch_id + created_by + updated_by)
router.post("/", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    let roles;
    console.log( req.body)

    if (Array.isArray(payload)) {
      // Multiple roles
      roles = await Role.bulkCreate(
        payload.map((p) => ({
          ...p,
          created_by: userId,
          updated_by: userId,
        })),
        { validate: true }
      );
    } else {
      // Single role
      roles = await Role.create({
        ...payload,
        created_by: userId,
        updated_by: userId,
      });
    }

    res.status(201).json(roles);
  } catch (err) {
    console.error("❌ Error creating roles:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get role by ID (with branch)
router.get("/:id", isAuth, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Branch, attributes: ["id", "name", "type", "city"] }],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update role (set updated_by from logged-in user)
router.put("/:id", isAuth, async (req, res) => {
  try {
    const { name, description, branch_id } = req.body;
    const userId = req.user.id;
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.branch_id = branch_id || role.branch_id;
    role.updated_by = userId; // logged-in user is updating

    await role.save();

    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete role
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.destroy();
    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
