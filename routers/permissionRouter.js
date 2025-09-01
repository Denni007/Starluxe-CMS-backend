import { Router } from "express";
import auth from "../middleware/auth.js";
import { Permission } from "../models/index.js";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../constants/permissions.js";
import { Op } from "sequelize";

const router = Router();
router.use(auth);

// ENUMS (supported)
router.get("/supported", (req, res) => {
  res.json({ modules: PERMISSION_MODULES, actions: PERMISSION_ACTIONS });
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const row = await Permission.create(req.body); // {module, action}
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// CREATE (bulk)
router.post("/bulk", async (req, res) => {
  try {
    const rows = await Permission.bulkCreate(req.body || [], { validate: true, ignoreDuplicates: true });
    res.json({ count: rows.length, rows });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// LIST
router.get("/", async (req, res) => {
  const { page = 1, limit = 50, q } = req.query;
  const where = q
    ? {
        [Op.or]: [
          { module: { [Op.like]: `%${q}%` } },
          { action: { [Op.like]: `%${q}%` } },
        ],
      }
    : {};
  const rows = await Permission.findAndCountAll({
    where,
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    order: [["id", "ASC"]],
  });
  res.json(rows);
});

// READ
router.get("/:id", async (req, res) => {
  const row = await Permission.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const [n] = await Permission.update(req.body, { where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: "Not found" });
    const row = await Permission.findByPk(req.params.id);
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE (bulk)
router.put("/bulk", async (req, res) => {
  try {
    const payload = req.body || [];
    let updated = 0;
    for (const p of payload) {
      const { id, ...data } = p;
      if (!id) continue;
      const [n] = await Permission.update(data, { where: { id } });
      updated += n;
    }
    res.json({ updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const n = await Permission.destroy({ where: { id: req.params.id } });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ deleted: n });
});

// DELETE (bulk)
router.delete("/bulk", async (req, res) => {
  const { ids = [] } = req.body || {};
  const n = await Permission.destroy({ where: { id: ids } });
  res.json({ deleted: n });
});

export default router;
