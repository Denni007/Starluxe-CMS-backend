import express from "express";
import cors from "cors";
import sequelize from "./database/db.js";   // Sequelize instance
import dotenv from "dotenv";
import industryRouter from "./routers/industryRouter.js";
import userRouter from "./routers/userRouter.js";
import businessRouter from "./routers/businessRouter.js";
import branchRouter from "./routers/branchRouter.js";
import roleRouter from "./routers/roleRouter.js";

dotenv.config(); // Load .env variables

const app = express();

// Define allowed origins (can also move to .env if needed)
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // if (!origin || allowedOrigins.includes(origin)) {
    if(origin) {
      callback(null, true);
    } else {
      const error = new Error("Not allowed by CORS");
      console.error(error.message);
      error.status = 403;
      callback(error);
    }
  },
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Access-Control-Allow-Origin",
  ],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" })); // no need for body-parser

// Routes
app.get("/test", (req, res) => {
  res.send("✅ API is working fine!");
});

app.use("/api/industry", industryRouter);
app.use("/api/user", userRouter);
app.use("/api/business", businessRouter);
app.use("/api/business", businessRouter);
app.use("/api/branch", branchRouter); 
app.use("/api/role", roleRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "A server error has occurred",
    error: err.message,
  });
});

// Connect DB & start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Sync tables based on models
    // await sequelize.sync({ force: true });
    await sequelize.sync();
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
})();
