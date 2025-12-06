const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./app/config");     // Sequelize instance
require("./app/models");                       // ⬅️ ensure ALL models are registered once
const routes = require("./app/route");
const { seedAdmin } = require("./seedrs/seeds"); // ⬅️ use "seeders", not "seedrs"

const app = express();
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);  // accept any origin dynamically
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/test", (_req, res) => res.send("✅ API working"));

// Mount routes (server won’t accept requests until after listen())
app.use("/api", routes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.stack);
  res.status(400).json({ message: "Server error", error: err.message });
});

(async () => {
  try {
    await sequelize.authenticate();

    // Choose sync strategy via env:
    // DB_SYNC=safe | alter | force
    const mode = (process.env.DB_SYNC || "safe").toLowerCase();

    if (mode === "force") {
      await sequelize.sync({ force: true });
    } else if (mode === "alter") {
      if (sequelize.getDialect() === "sqlite") {
        await sequelize.query("PRAGMA foreign_keys = OFF");
        await sequelize.sync({ alter: true });
        await sequelize.query("PRAGMA foreign_keys = ON");
      } else {
        await sequelize.sync({ alter: true });
      }
    } else {
      await sequelize.sync(); // safe default: creates missing tables, no drops
    }

    await seedAdmin(); // <-- run seeds AFTER tables exist

    // 4) Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup Error:", err);
    process.exit(1);
  }
})();

module.exports = app;