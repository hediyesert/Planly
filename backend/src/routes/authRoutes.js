const express = require("express");
const { register, login } = require("../controllers/authController");
const { requireFields } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post("/register", requireFields(["username", "email", "password"]), register);
router.post("/login", requireFields(["email", "password"]), login);

module.exports = router;
