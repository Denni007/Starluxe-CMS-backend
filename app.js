const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB, dbPath } = require("./app/config/index.js");
const routes = require("./app/routers/index.js");
const seedAdmin = require("./app/seeds/seeds.js");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/test", (req, res) => {
  res.send(`✅ API working, DB at ${dbPath}`);
});

// Routes
app.use("/api", routes);

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Boot
(async () => {
  try {
    await initDB("alter"); // "alter" | "force" | "none"
    await seedAdmin();

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
})();

module.exports = app;
