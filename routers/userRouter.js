// import express from "express";
// import {User} from "../models/index.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { Op } from "sequelize";

// const router = express.Router();

// // 📌 Create User
// router.post("/signup", async (req, res) => {
//   try {
//     const {
//       email,
//       first_name,
//       last_name,
//       mobile_number,
//       password,
//       password_confirmation,
//       user_name,
//       gender,
//     } = req.body;

//     if (
//       !email ||
//       !first_name ||
//       !last_name ||
//       !mobile_number ||
//       !user_name ||
//       !gender ||
//       !password ||
//       !password_confirmation
//     ) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     if (password !== password_confirmation) {
//       return res.status(400).json({ error: "Passwords do not match" });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ error: "Password must be at least 6 characters long" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       email,
//       first_name,
//       last_name,
//       mobile_number,
//       password: hashedPassword,
//       user_name,
//       gender,
//     });

//     res.status(201).json({
//       message: "User created successfully"
//     });
//   } catch (err) {
//     console.error("❌ Error creating user:", err);

//     if (err.name === "SequelizeUniqueConstraintError") {
//       const field = err.errors[0].path;
//       let message = "Duplicate value";

//       if (field === "email") message = "Email already exists";
//       if (field === "user_name") message = "Username already taken";
//       if (field === "mobile_number") message = "Mobile number already registered";

//       return res.status(400).json({ error: message });
//     }

//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({ error: err.errors[0].message });
//     }

//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // 📌 Login User
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ error: "email/username and password are required" });
//     }

//     const user = await User.findOne({
//       where: {
//         [Op.or]: [{ email: email }, { user_name: email }],
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id }, 
//       "passwordKey", 
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: { id: user.id, email: user.email, user_name: user.user_name, first_name: user.first_name, last_name: user.last_name, mobile_number: user.mobile_number}
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 📌 Update user by ID
// router.patch("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 🔹 Find user
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // 🔹 Get all fields from model definition
//     const modelFields = Object.keys(User.rawAttributes);

//     // Build updates dynamically
//     const updates = {};
//     modelFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     // If no valid fields are passed
//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ error: "No valid fields provided for update" });
//     }

//     // 🔹 Update user
//     await user.update(updates);

//     res.json({
//       message: "User updated successfully",
//       user,
//     });
//   } catch (err) {
//     console.error("❌ Update error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 📌 Get all Users
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.findAll();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 📌 Get user by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 📌 Delete user by ID
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await User.destroy({
//       where: { id: req.params.id },
//     });
//     if (!deleted) return res.status(404).json({ error: "User not found" });
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete("/", async (req, res) => {
//   try {
//     const deleted = await User.destroy({ where: {}, truncate: true });
//     res.json({ message: "All users deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import { Router } from "express";
import bcrypt from "bcrypt";
import auth from "../middleware/auth.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import {isAuth} from "../utill.js";

const router = Router();
// CREATE (single)
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const row = await User.create(data);
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.get("/me", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findAll({
      where: { id: userId },
      order: [["first_name", "ASC"]]
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// CREATE (bulk)
router.post("/bulk", async (req, res) => {
  try {
    const users = await Promise.all(
      (req.body || []).map(async u => ({
        ...u,
        password: u.password ? await bcrypt.hash(u.password, 10) : undefined,
      }))
    );
    const rows = await User.bulkCreate(users, { validate: true, ignoreDuplicates: false });
    res.json({ count: rows.length, rows });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// LIST (with pagination & q search)
router.get("/", async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const where = q
    ? {
        [Op.or]: [
          { user_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { first_name: { [Op.like]: `%${q}%` } },
          { last_name: { [Op.like]: `%${q}%` } },
        ],
      }
    : {};
  const rows = await User.findAndCountAll({
    where,
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    attributes: { exclude: ["password"] },
    order: [["id", "DESC"]],
  });
  res.json(rows);
});

// READ (by id)
router.get("/:id", async (req, res) => {
  const row = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

// UPDATE (single)
router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const [n] = await User.update(data, { where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: "Not found" });
    const row = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE (bulk) — array of {id, ...fields}
router.put("/bulk", async (req, res) => {
  try {
    const payload = req.body || [];
    let updated = 0;
    for (const u of payload) {
      const data = { ...u };
      const id = data.id;
      delete data.id;
      if (!id) continue;
      if (data.password) data.password = await bcrypt.hash(data.password, 10);
      const [n] = await User.update(data, { where: { id } });
      updated += n;
    }
    res.json({ updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE (single)
router.delete("/:id", async (req, res) => {
  const n = await User.destroy({ where: { id: req.params.id } });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ deleted: n });
});

// DELETE (bulk) — body: { ids: [] }
router.delete("/bulk", async (req, res) => {
  const { ids = [] } = req.body || {};
  const n = await User.destroy({ where: { id: ids } });
  res.json({ deleted: n });
});

export default router;
