// app/config/index.js
const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { SQLITE_PATH } = process.env;
const DB_FILE = SQLITE_PATH || path.join(__dirname, "..", "data", "app.sqlite");

// Ensure folder + file exist (for SQLite)
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "");

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_FILE,
  logging: false,
  pool: { max: 1, min: 0, idle: 10000, acquire: 120000 }, // <= important for sqlite
  retry: { max: 5 },
});

// ✅ Export only sequelize instance
module.exports = sequelize;
