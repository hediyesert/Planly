const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  updateMe,
  changePassword,
  deleteMe,
  addFriend,
  removeFriend,
  saveCurrentPlan,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.put("/me", updateMe);
router.put("/me/password", changePassword);
router.delete("/me", deleteMe);
router.post("/me/friends", addFriend);
router.delete("/me/friends/:friendName", removeFriend);
router.put("/me/plan", saveCurrentPlan);

module.exports = router;