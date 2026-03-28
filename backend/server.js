const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const examsRoutes = require("./routes/exams");
const scheduleRoutes = require("./routes/schedule");
const analyticsRoutes = require("./routes/analytics");
const liveRoutes = require("./routes/live");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database bağlantısı
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", examsRoutes);
app.use("/api", scheduleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/live", liveRoutes);

// test endpoint
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// server — 0.0.0.0: Docker / tarayıcıdan gelen bağlantılar için (yalnızca 127.0.0.1 değil)
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server http://${HOST}:${PORT} adresinde dinliyor`);
});