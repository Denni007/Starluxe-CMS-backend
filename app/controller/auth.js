const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Branch, Business, Role, User, UserBusinessRole } = require("../models");
const { getToken } = require("../middleware/utill");

// POST /signup
exports.signup = async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      mobile_number,
      password,
      password_confirmation,
      user_name,
      gender,
    } = req.body;

    if (
      !email ||
      !first_name ||
      !last_name ||
      !mobile_number ||
      !user_name ||
      !gender ||
      !password ||
      !password_confirmation
    ) {
      return res.status(400).json({ status: "false", message: "All fields are required" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ status: "false", message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ status: "false", message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      first_name,
      last_name,
      mobile_number,
      password: hashedPassword,
      user_name,
      gender,
    });

    return res.json({ status: "true", message: "User created successfully" });
  } catch (err) {
    console.error("❌ Error creating user:", err);

    if (err.name === "SequelizeUniqueConstraintError" && err.errors?.[0]) {
      const field = err.errors[0].path;
      let message = "Duplicate value";

      if (field === "email") message = "Email already exists";
      if (field === "user_name") message = "Username already taken";
      if (field === "mobile_number") message = "Mobile number already registered";

      return res.status(400).json({ status: "false", message });
    }

    if (err.name === "SequelizeValidationError" && err.errors?.[0]) {
      return res.status(400).json({ status: "false", message: err.errors[0].message });
    }

    return res.status(500).json({ status: "false", message: "Something went wrong" });
  }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // `email` can be email or username

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "false", message: "email/username and password are required" });
    }

    // find user by email OR username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { user_name: email }],
      },
    });

    if (!user) {
      return res.status(404).json({ status: "false", message: "User not found" });
    }

    // validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: "false", message: "Invalid password" });
    }

    // fetch memberships (business, branch, role)
    const memberships = await UserBusinessRole.findAll({
      where: { user_id: user.id },
      include: [
        { model: Role, as: "role", attributes: ["id", "name"] },
        { model: Business, as: "business", attributes: ["id", "name"] },
        { model: Branch, as: "branch", attributes: ["id", "name", "type", "city"] },
      ],
    });

    // generate JWT
    const token = getToken(user);

    return res.json({
      status: "true",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
          is_admin: user.is_admin,
          memberships: memberships.map((m) => ({
            businessId: m.business_id,
            businessName: m.business?.name,
            branchId: m.branch_id,
            branchName: m.branch?.name,
            roleId: m.role_id,
            roleName: m.role?.name,
          })),
        },
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({ status: "false", message: "Server error" });
  }
};
