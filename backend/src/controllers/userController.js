const mongoose = require("mongoose");
const User = require("../models/User");
const StudyPlan = require("../models/StudyPlan");
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");
const Friend = require("../models/Friend");
const WeeklyAnalysis = require("../models/WeeklyAnalysis");

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (q.length < 2) {
      return res.status(400).json({ message: "Arama en az 2 karakter olmalı" });
    }
    const safe = escapeRegex(q);
    const re = new RegExp(safe, "i");
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [{ username: re }, { email: re }],
    })
      .select("username email")
      .limit(15)
      .lean();
    return res.json(
      users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
      }))
    );
  } catch (e) {
    next(e);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut şifre ve yeni şifre gerekli" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalı" });
    }
    const user = await User.findById(req.userId).select("+password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "Mevcut şifre hatalı" });
    user.password = newPassword;
    await user.save();
    return res.json({ message: "Şifre güncellendi" });
  } catch (e) {
    next(e);
  }
}

async function updateMe(req, res, next) {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase().trim();
    await user.save();
    return res.json({ user: user.toSafeJSON() });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "Kullanıcı adı veya e-posta kullanımda" });
    }
    next(e);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Sadece kendi hesabınızı silebilirsiniz" });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const plans = await StudyPlan.find({ user: uid }).select("_id");
    const planIds = plans.map((p) => p._id);
    await Task.deleteMany({ user: uid });
    await Task.deleteMany({ studyPlan: { $in: planIds } });
    await StudySession.deleteMany({ user: uid });
    await StudyPlan.deleteMany({ user: uid });
    await Friend.deleteMany({ $or: [{ fromUser: uid }, { toUser: uid }] });
    await WeeklyAnalysis.deleteMany({ user: uid });
    await User.findByIdAndDelete(uid);
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { searchUsers, changePassword, updateMe, deleteUser };
