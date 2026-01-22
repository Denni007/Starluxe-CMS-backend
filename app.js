require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./app/config");   // Sequelize instance
// require("./app/models");                     // Register models

const initRoutes = require("./app/route");
const { existingData, existingPermission } = require("./seedrs/custom_seeder");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);  // accept any origin dynamically
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

app.use("/api", initRoutes);

app.get("/test", (_req, res) => res.send("✅ API sworking"));
// Health check
app.get("/tests", (_req, res) => res.send("✅ API working d nice in the main"));
app.get("/", (_req, res) => res.send("✅ API not nice in the sql "));

/* =====================================================
   BOOTSTRAP (ORDER IS NOW CORRECT)
===================================================== */
/* =====================================================
   BOOTSTRAP (ORDER IS NOW CORRECT)
===================================================== */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("🔁 DB synced");

      if (process.env.SEED_FORCE === "1") {
        await existingData();
        await existingPermission();
        console.log("🌱 Custom Seeders executed");
      }
    }

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;