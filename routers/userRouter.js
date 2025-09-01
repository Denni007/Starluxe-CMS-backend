import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// 📌 Create User
router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      mobile_number,
      password,
      password_confirmation,
      user_name,
      dob,
      gender,
    } = req.body;

    // ✅ Check all mandatory fields
    if (
      !email ||
      !first_name ||
      !last_name ||
      !mobile_number ||
      !user_name ||
      !dob ||
      !gender ||
      !password ||
      !password_confirmation
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Passwords match?
    if (password !== password_confirmation) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // ✅ Password strength check
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      email,
      first_name,
      last_name,
      mobile_number,
      password: hashedPassword,
      user_name,
      dob,
      gender,
    });

    // ✅ Send safe response (don’t return password)
    res.status(201).json({
      message: "User created successfully"
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);

    // ✅ Handle Sequelize unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors[0].path;
      let message = "Duplicate value";

      if (field === "email") message = "Email already exists";
      if (field === "user_name") message = "Username already taken";
      if (field === "mobile_number") message = "Mobile number already registered";

      return res.status(400).json({ error: message });
    }

    // ✅ Handle Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors[0].message });
    }

    res.status(500).json({ error: "Something went wrong" });
  }
});

// 📌 Login User
router.post("/login", async (req, res) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ error: "user_name and password are required" });
    }

    // ✅ Find user by user_name only
    const user = await User.findOne({ where: { user_name } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id }, // payload
      "passwordKey",   // secret (store in env file ideally)
      { expiresIn: "1h" } // token expiry
    );

    res.status(200).json({
      message: "Login successful",
      token, // return token to frontend
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Update user by ID
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 Get all fields from model definition
    const modelFields = Object.keys(User.rawAttributes);

    // Build updates dynamically
    const updates = {};
    modelFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If no valid fields are passed
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    // 🔹 Update user
    await user.update(updates);

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get all Users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete user by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const deleted = await User.destroy({ where: {}, truncate: true });
    res.json({ message: "All users deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
