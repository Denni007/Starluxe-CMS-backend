require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./app/config");   // Sequelize instance
// require("./app/models");                     // Register models

const initRoutes = require("./app/route");
const { seedAdmin } = require("./seedrs/seeds");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api", initRoutes);

app.get("/test", (_req, res) => res.send("✅ API working"));

/* =====================================================
   BOOTSTRAP (ORDER IS NOW CORRECT)
===================================================== */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("🔁 DB synced");

      if (process.env.SEED_FORCE === "1") {
        await seedAdmin(); // ✅ SAFE NOW
        console.log("🌱 Seeders executed");
      }
    }

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();

module.exports = app;