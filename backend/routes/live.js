const express = require("express");
const router = express.Router();

const {
  getMySession,
  updateMySession,
  getFriendsSessions,
} = require("../controllers/liveController");

router.get("/me", getMySession);
router.put("/me", updateMySession);
router.get("/friends", getFriendsSessions);

module.exports = router;

