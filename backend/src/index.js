require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const { specs, swaggerUi } = require("./utils/swagger");

const authRoutes = require("./routes/auth");
const evidenceRoutes = require("./routes/evidence");
const analysisRoutes = require("./routes/analysis");
const roadmapRoutes = require("./routes/roadmap");
const chatRoutes = require("./routes/chat");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    "https://kalenz-career-discovery-platform.vercel.app/",
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "karrerlenz-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`KarrerLenz API running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});

module.exports = app;
