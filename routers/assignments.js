import { Router } from "express";
import auth from "../middleware/auth.js";
import { UserBusinessRole, User, Business, Branch, Role } from "../models/index.js";
import { Op } from "sequelize";
import { isAuth } from "../middleware/utill.js";

const router = Router();
// ASSIGN (create or upsert)
router.post("/", isAuth, async (req, res) => {
  try {
    const { user_id, business_id, branch_id, role_id } = req.body;

    // fetch all entities
    const [user, business, branch, role] = await Promise.all([
      User.findByPk(user_id),
      Business.findByPk(business_id),
      Branch.findByPk(branch_id),
      Role.findByPk(role_id),
    ]);

    if (!user) return res.status(400).json({ error: "Invalid user" });
    if (!business) return res.status(400).json({ error: "Invalid business" });
    if (!branch) return res.status(400).json({ error: "Invalid branch" });
    if (!role) return res.status(400).json({ error: "Invalid role" });

    // ✅ check branch belongs to business
    if (branch.business_id !== business.id) {
      return res.status(400).json({ error: "Branch must belong to business" });
    }

    // ✅ check role belongs to same business
    if (role.business_id && role.business_id !== business.id) {
      return res.status(400).json({ error: "Role must belong to the same business" });
    }

    const [row, created] = await UserBusinessRole.upsert({
      user_id,
      business_id,
      branch_id,
      role_id,
    });

    res.json({ message: created ? "Assigned (new)" : "Updated", row });
  } catch (e) {
    console.error("❌ Error assigning role:", e);
    res.status(400).json({ error: e.message });
  }
});


// ASSIGN (bulk) — array of {user_id,business_id,branch_id,role_id}
router.post("/bulk", isAuth, async (req, res) => {
  try {
    const payload = req.body || [];
    const rows = await UserBusinessRole.bulkCreate(payload, {
      validate: true,
      updateOnDuplicate: ["role_id", "business_id", "branch_id"],
    });
    res.json({ count: rows.length, rows });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// LIST all (filters optional)
router.get("/",isAuth,  async (req, res) => {
  const { page = 1, limit = 50, user_id, business_id, branch_id, role_id } = req.query;
  const where = {
    ...(user_id ? { user_id: Number(user_id) } : {}),
    ...(business_id ? { business_id: Number(business_id) } : {}),
    ...(branch_id ? { branch_id: Number(branch_id) } : {}),
    ...(role_id ? { role_id: Number(role_id) } : {}),
  };

  const rows = await UserBusinessRole.findAndCountAll({
    where,
    include: [{ model: User, as: "user" }, { model: Business, as: "business" }, { model: Branch, as: "branch" }, { model: Role, as: "role" }],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    order: [["id", "DESC"]],
  });
  res.json(rows);
});

// LIST by user
router.get("/user/:userId",isAuth,  async (req, res) => {
  const rows = await UserBusinessRole.findAll({
    where: { user_id: Number(req.params.userId) },
    include: ["business", "branch", "role"],
    order: [["id", "DESC"]],
  });
  res.json(rows);
});

// READ (by id)
router.get("/:id",isAuth,  async (req, res) => {
  const row = await UserBusinessRole.findByPk(req.params.id, { include: ["user", "business", "branch", "role"] });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

// UPDATE (single) — change role/branch/business for this assignment
router.put("/:id", isAuth, async (req, res) => {
  try {
    const [n] = await UserBusinessRole.update(req.body, { where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: "Not found" });
    const row = await UserBusinessRole.findByPk(req.params.id, { include: ["user", "business", "branch", "role"] });
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE (bulk) — array of {id,...fields}
router.put("/bulk",isAuth,  async (req, res) => {
  try {
    const payload = req.body || [];
    let updated = 0;
    for (const a of payload) {
      const { id, ...data } = a;
      if (!id) continue;
      const [n] = await UserBusinessRole.update(data, { where: { id } });
      updated += n;
    }
    res.json({ updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE (single)
router.delete("/:id",isAuth,  async (req, res) => {
  const n = await UserBusinessRole.destroy({ where: { id: req.params.id } });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ deleted: n });
});

// DELETE (bulk)
router.delete("/bulk", isAuth, async (req, res) => {
  const { ids = [] } = req.body || {};
  const n = await UserBusinessRole.destroy({ where: { id: ids } });
  res.json({ deleted: n });
});

export default router;
