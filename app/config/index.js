const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");
require("dotenv").config();

import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// You can override this with an env var if you want a different location
// e.g. SQLITE_PATH=./var/db/app.sqlite
const DB_FILE = process.env.SQLITE_PATH || path.join(__dirname, "data", "app.sqlite");

// Make sure the folder exists (e.g. src/database/data/)
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_FILE,
  logging: false, // set to console.log for SQL debug
  pool: {
    max: 1,        // serialize writes to avoid SQLITE_BUSY
    min: 0,
    idle: 10000,
    acquire: 60000,
  },
  retry: { max: 5 },
});

// Optional: expose a helper to tune SQLite for fewer "database is locked" errors
export async function tuneSqlite() {
  await sequelize.query("PRAGMA journal_mode = WAL;");
  await sequelize.query("PRAGMA synchronous = NORMAL;");
  await sequelize.query("PRAGMA busy_timeout = 10000;");
}

// Export the resolved path so other files (like seeds) can log it
export const dbPath = DB_FILE;

// Immediately ensure DB + connect + sync
(async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log("✅ Sequelize connected.");

    if (DB_SYNC_MODE === "force") {
      await sequelize.sync({ force: true });
      console.log("🔁 sequelize.sync({ force: true }) complete.");
    } else if (DB_SYNC_MODE === "alter") {
      await sequelize.sync({ alter: true });
      console.log("🔁 sequelize.sync({ alter: true }) complete.");
    } else {
      console.log("ℹ️ Skipping sequelize.sync() (DB_SYNC_MODE=none).");
    }
  } catch (error) {
    console.error("❌ DB init error:", error);
    // process.exit(1); // uncomment to hard-exit on failure
  }
})();

module.exports = sequelize;
