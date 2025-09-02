// import { Sequelize } from "sequelize";
// import dotenv from "dotenv";

// dotenv.config();

// const sequelize = new Sequelize({
//   dialect: process.env.DB_DIALECT || "sqlite",
//   storage: process.env.DB_STORAGE || "./database.sqlite",
//   logging: false, // disable SQL logs
// });

// export default sequelize;
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

export default sequelize;
