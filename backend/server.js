const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

dotenv.config();

const { setupApp } = require("./src/setupApp");
const { connectDB } = require("./src/config/db");
const { seedExamData } = require("./src/seeds/examSeed");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST"] },
});

let dbReady = connectDB()
  .then(() => seedExamData())
  .catch((err) => {
    console.error("DB init failed:", err);
  });

app.use(async (_req, _res, next) => {
  await dbReady;
  next();
});

setupApp(app, io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Yetkisiz"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    return next();
  } catch {
    return next(new Error("Geçersiz token"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  dbReady.then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
    });
  });
}

module.exports = app;
