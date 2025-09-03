// routes/roleRoutes.js
import express from "express";
import Role from "../models/roleModel.js";
import Branch from "../models/branchModel.js";
import { isAuth } from "../middleware/utill.js";
import User from "../models/userModel.js";

const router = express.Router();

// 🔹 Get all roles with branch info
router.get("/", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.body)
    const roles = await Role.findAll({
      include: [{ model: Branch, 
        as: "branch", 
        
        attributes: ["id", "name", "type", "city"] }],
      order: [["name", "ASC"]],
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create role(s) (with branch_id)
// 🔹 Create role(s) (with branch_id, created_by, updated_by)
router.post("/", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    // Ensure the logged-in user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(400).json({ error: "Invalid user (created_by not found)" });
    }

    let roles;

    if (Array.isArray(payload)) {
      // ✅ Multiple roles
      for (const role of payload) {
        const branchExists = await Branch.findByPk(role.branch_id);
        if (!branchExists) {
          return res.status(400).json({ error: `Branch ${role.branch_id} not found` });
        }
      }

      const updatedPayload = payload.map((role) => ({
        ...role,
        created_by: userId,
        updated_by: userId,
      }));

      roles = await Role.bulkCreate(updatedPayload, { validate: true });
    } else {
      // ✅ Single role
      if (payload.branch_id) {
        const branchExists = await Branch.findByPk(payload.branch_id);
        if (!branchExists) {
          return res.status(400).json({ error: `Branch ${payload.branch_id} not found` });
        }
      }

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
router.get("/:id", isAuth,async (req, res) => {
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

// 🔹 Update role
router.put("/:id", isAuth,async (req, res) => {
  try {
    const { name, description, branch_id, updated_by } = req.body;
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.branch_id = branch_id || role.branch_id; // link to branch
    role.updated_by = updated_by || role.updated_by;

    await role.save();

    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete role
router.delete("/:id", isAuth,async (req, res) => {
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
