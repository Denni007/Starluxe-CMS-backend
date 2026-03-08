require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8845;

// Pass socketio instance to the app for use in controllers
app.set("socketio", io);

app.use(cors());
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Consider restricting this in production
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

const sequelize = require("./app/config");
const initRoutes = require("./app/route");
const { existingData, existingPermission } = require("./seedrs/custom_seeder");

// Initialize and configure WebSocket connections
require("./app/socket/chat")(io);

app.use("/api", initRoutes);

app.get("/test", (_req, res) => res.send("✅ API working"));
app.get("/tests", (_req, res) => res.send("✅ API working d nice in the main"));
app.get("/", (_req, res) => res.send("✅ API not nice in the sql "));

const createTunnel = require("./app/config/sshTunnel");

const startServer = async () => {
  try {
    await createTunnel();
    await sequelize.authenticate();
    console.log("✅ DB connected");

    if (process.env.NODE_ENV !== "production" && process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      console.log("🔁 DB synced");

      if (process.env.SEED_FORCE === "1") {
        await existingData();
        await existingPermission();
        console.log("🌱 Custom Seeders executed");
      }
    }

    server.listen(PORT, () =>
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
