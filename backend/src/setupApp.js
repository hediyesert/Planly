const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const openapi = require("./docs/openapi");

const authRoutes = require("./routes/authRoutes");
const examTypeRoutes = require("./routes/examTypeRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const noopIo = {
  to() {
    return { emit() {} };
  },
};

function setupApp(app, io) {
  app.set("io", io || noopIo);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Planly backend çalışıyor");
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: "Planly API",
    })
  );

  app.use("/auth", authRoutes);
  app.use("/exam-types", examTypeRoutes);
  app.use("/study-plans", studyPlanRoutes);
  app.use("/study-sessions", studySessionRoutes);
  app.use("/tasks", taskRoutes);
  app.use("/users", userRoutes);
  app.use("/friends", friendRoutes);
  app.use("/analytics", analyticsRoutes);

  app.use(errorMiddleware);
}

module.exports = { setupApp, noopIo };
