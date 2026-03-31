const { test, before, after } = require("node:test");
const assert = require("node:assert");
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

if (!process.env.TEST_MONGODB_URI) {
  process.env.TEST_MONGODB_URI = "mongodb://127.0.0.1:27017/planly_test";
}

const { setupApp } = require("../src/setupApp");
const { seedExamData } = require("../src/seeds/examSeed");

const TEST_DB = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;

let app;

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_ci";
  await mongoose.connect(TEST_DB);
  await seedExamData();
  const application = express();
  const noopIo = { to: () => ({ emit() {} }) };
  setupApp(application, noopIo);
  app = application;
});

after(async () => {
  await mongoose.disconnect();
});

test("POST /auth/register ve POST /auth/login", async () => {
  const suffix = Date.now();
  const reg = await request(app)
    .post("/auth/register")
    .send({ username: `u${suffix}`, email: `u${suffix}@t.com`, password: "secret12" });
  assert.strictEqual(reg.status, 201, reg.text);
  assert.ok(reg.body.token);

  const login = await request(app).post("/auth/login").send({ email: `u${suffix}@t.com`, password: "secret12" });
  assert.strictEqual(login.status, 200, login.text);
  assert.ok(login.body.token);
});

test("GET /exam-types — yetkisiz 401", async () => {
  const res = await request(app).get("/exam-types");
  assert.strictEqual(res.status, 401);
});

test("GET /exam-types — token ile 200", async () => {
  const suffix = Date.now() + 1;
  const reg = await request(app)
    .post("/auth/register")
    .send({ username: `v${suffix}`, email: `v${suffix}@t.com`, password: "secret12" });
  const token = reg.body.token;
  const res = await request(app).get("/exam-types").set("Authorization", `Bearer ${token}`);
  assert.strictEqual(res.status, 200, res.text);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test("PUT /users/me/password — şifre değişir", async () => {
  const suffix = Date.now() + 2;
  await request(app)
    .post("/auth/register")
    .send({ username: `p${suffix}`, email: `p${suffix}@t.com`, password: "oldpass12" });
  const login = await request(app)
    .post("/auth/login")
    .send({ email: `p${suffix}@t.com`, password: "oldpass12" });
  const token = login.body.token;

  const bad = await request(app)
    .put("/users/me/password")
    .set("Authorization", `Bearer ${token}`)
    .send({ currentPassword: "wrong", newPassword: "newpass12" });
  assert.strictEqual(bad.status, 401);

  const ok = await request(app)
    .put("/users/me/password")
    .set("Authorization", `Bearer ${token}`)
    .send({ currentPassword: "oldpass12", newPassword: "newpass99" });
  assert.strictEqual(ok.status, 200, ok.text);

  const login2 = await request(app)
    .post("/auth/login")
    .send({ email: `p${suffix}@t.com`, password: "newpass99" });
  assert.strictEqual(login2.status, 200);
});
