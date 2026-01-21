// const { Sequelize } = require("sequelize");
// const path = require("path");
// const fs = require("fs");
// require("dotenv").config();

// const {
//   DB_DIALECT,
//   DB_NAME,
//   DB_USERNAME,
//   DB_PASSWORD,
//   DB_HOST,
//   DB_PORT,
//   SQLITE_PATH,
// } = process.env;

// let sequelize;

// if (DB_DIALECT === "sqlite") {
//   const DB_FILE =
//     SQLITE_PATH || path.join(__dirname, "..", "database", "data", "app.sqlite");

//   fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
//   if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "");

//   sequelize = new Sequelize({
//     dialect: "sqlite",
//     storage: DB_FILE,
//     logging: false,
//   });

//   console.log("🟢 SQLite initialized");
// } else {
//   sequelize = new Sequelize({
//     database: DB_NAME,
//     username: DB_USERNAME,
//     password: DB_PASSWORD,
//     host: DB_HOST,
//     dialect: 'mysql',
//     logging: true
//   });
//   try {
//     sequelize.authenticate();
//     sequelize.sync({ alter: true });
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//     // process.exit(1);
//   }
//   // console.log("🔵 MySQL initialized");
// }

// module.exports = sequelize; // ✅ EXPORT IMMEDIATELY

const { Sequelize } = require("sequelize");
const { config } = require("dotenv");
config();
const { DB_USERNAME, DB_NAME, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    // logging: console.log,
  })
  : new Sequelize(
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    {
      host: DB_HOST,
      dialect: "mysql",
      // logging: console.log,
    }
  );


module.exports = sequelize;
