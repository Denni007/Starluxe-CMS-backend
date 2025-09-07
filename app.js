// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./app/config"); // the instance
const routes = require("./app/route");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/test", (_req, res) => res.send("✅ API working"));
app.use("/api", routes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// 🚀 Boot here (not in config/index.js)
(async () => {


  // try {
  //   await sequelize.authenticate();
  //   // optional: see generated SQL while debugging
  //   sequelize.options.logging = console.log;

  //   const models = sequelize.models;
  //   for (const [name, model] of Object.entries(models)) {
  //     try {
  //       console.log(`⏳ syncing model: ${name}`);
  //       await model.sync({ alter: true });
  //       console.log(`✅ synced: ${name}`);
  //     } catch (e) {
  //       console.error(`❌ sync failed for model: ${name}`);
  //       if (e && e.errors) {
  //         for (const ve of e.errors) {
  //           console.error(`  • path: ${ve.path} | message: ${ve.message} | value: ${ve.value}`);
  //         }
  //       } else {
  //         console.error(e);
  //       }
  //       throw e; // stop boot once we know the offender
  //     }
  //   }

  //   console.log("✅ all models synced");
  //   // ... app.listen() here
  // } catch (err) {
  //   console.error("❌ Startup Error:", err.message);
  //   process.exit(1);
  // }


  
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true });

    await sequelize.sync(); 

    // await sequelize.models.Business.sync({ alter: true });
    // await sequelize.models.User.sync({ alter: true });
    // await sequelize.models.Branch.sync({ alter: true });
    // await sequelize.models.Role.sync({ alter: true });
    // await sequelize.models.Industry.sync({ alter: true });
    // await sequelize.models.Permission.sync({force: true });

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }

})();

module.exports = app;
