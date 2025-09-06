// app/controller/role.controller.js
// CommonJS + unified responses { status: "true"/"false", ... }

const Role = require("../models/role.js");
const Branch = require("../models/branch.js");
const User = require("../models/user.js");

/**
 * GET /roles
 * Includes branch info
 */
exports.list = async (req, res) => {
  try {
    const items = await Role.findAll({
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "type", "city"],
        },
      ],
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * GET /roles/:id
 * Includes branch info
 */
exports.get = async (req, res) => {
  try {
    const item = await Role.findByPk(req.params.id, {
      include: [
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city"] },
      ],
    });
    if (!item) return res.status(404).json({ status: "false", message: "Role not found" });
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * POST /roles
 * Supports single or bulk create
 * Automatically sets created_by / updated_by from auth user
 */
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Ensure auth user exists (optional hard check)
    const user = await User.findByPk(userId);
    if (!user) return res.status(400).json({ status: "false", message: "Invalid user" });

    const payload = req.body;

    // Helper to verify branch exists
    const ensureBranch = async (branch_id) => {
      if (!branch_id) return true; // allow null if model permits
      const b = await Branch.findByPk(branch_id);
      if (!b) throw new Error(`Branch ${branch_id} not found`);
      return true;
    };

    let data;

    if (Array.isArray(payload)) {
      // Validate all branches first
      for (const r of payload) await ensureBranch(r.branch_id);

      const rows = payload.map((r) => ({
        ...r,
        created_by: userId,
        updated_by: userId,
      }));
      data = await Role.bulkCreate(rows, { validate: true });
    } else {
      await ensureBranch(payload.branch_id);
      data = await Role.create({
        ...payload,
        created_by: userId,
        updated_by: userId,
      });
    }

    res.status(201).json({ status: "true", data });
  } catch (e) {
    console.error("❌ Error creating roles:", e.message);
    const message = /Branch .* not found/.test(e.message) ? e.message : e.message;
    res.status(500).json({ status: "false", message });
  }
};

/**
 * PUT /roles/:id
 */
exports.update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description, branch_id } = req.body;

    const item = await Role.findByPk(req.params.id);
    if (!item) return res.status(404).json({ status: "false", message: "Role not found" });

    if (branch_id && branch_id !== item.branch_id) {
      const b = await Branch.findByPk(branch_id);
      if (!b) return res.status(400).json({ status: "false", message: `Branch ${branch_id} not found` });
      item.branch_id = branch_id;
    }

    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.updated_by = userId ?? item.updated_by;

    await item.save();
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};

/**
 * DELETE /roles/:id
 */
exports.remove = async (req, res) => {
  try {
    const count = await Role.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ status: "false", message: "Role not found" });
    res.json({ status: "true", deleted: count });
  } catch (e) {
    res.status(500).json({ status: "false", message: e.message });
  }
};
