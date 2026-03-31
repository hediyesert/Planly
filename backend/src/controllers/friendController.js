const User = require("../models/User");
const Friend = require("../models/Friend");
const StudySession = require("../models/StudySession");
const { computeElapsedMs } = require("../services/timerService");

async function friendUserIds(userId) {
  const rows = await Friend.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
  }).lean();
  return rows.map((r) => (String(r.fromUser) === String(userId) ? r.toUser : r.fromUser));
}

async function sendRequest(req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email && !username) {
      return res.status(400).json({ message: "email veya username gerekli" });
    }
    const q = email ? { email } : { username };
    const target = await User.findOne(q);
    if (!target) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    if (String(target._id) === String(req.userId)) {
      return res.status(400).json({ message: "Kendinize istek gönderemezsiniz" });
    }
    const existing = await Friend.findOne({
      $or: [
        { fromUser: req.userId, toUser: target._id },
        { fromUser: target._id, toUser: req.userId },
      ],
    });
    if (existing) {
      return res.status(409).json({ message: "İstek veya mevcut arkadaşlık zaten var" });
    }
    const f = await Friend.create({ fromUser: req.userId, toUser: target._id, status: "pending" });
    return res.status(201).json(f);
  } catch (e) {
    next(e);
  }
}

async function accept(req, res, next) {
  try {
    const f = await Friend.findById(req.params.id);
    if (!f || String(f.toUser) !== String(req.userId)) {
      return res.status(404).json({ message: "İstek bulunamadı" });
    }
    if (f.status !== "pending") {
      return res.status(400).json({ message: "Bu istek artık beklemede değil" });
    }
    f.status = "accepted";
    await f.save();
    return res.json(f);
  } catch (e) {
    next(e);
  }
}

async function listFriends(req, res, next) {
  try {
    const rows = await Friend.find({
      status: "accepted",
      $or: [{ fromUser: req.userId }, { toUser: req.userId }],
    })
      .populate("fromUser", "username email")
      .populate("toUser", "username email")
      .lean();
    const friends = rows.map((r) => {
      const other = String(r.fromUser._id) === String(req.userId) ? r.toUser : r.fromUser;
      return { id: other._id, username: other.username, email: other.email, friendshipId: r._id };
    });
    const pendingIncoming = await Friend.find({ toUser: req.userId, status: "pending" })
      .populate("fromUser", "username email")
      .lean();
    const pendingOutgoing = await Friend.find({ fromUser: req.userId, status: "pending" })
      .populate("toUser", "username email")
      .lean();
    return res.json({ friends, pendingIncoming, pendingOutgoing });
  } catch (e) {
    next(e);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const f = await Friend.findById(req.params.id);
    if (!f || String(f.toUser) !== String(req.userId)) {
      return res.status(404).json({ message: "İstek bulunamadı" });
    }
    if (f.status !== "pending") {
      return res.status(400).json({ message: "Bu kayıt artık beklemede değil" });
    }
    await f.deleteOne();
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function removeFriendship(req, res, next) {
  try {
    const f = await Friend.findById(req.params.id);
    if (!f) return res.status(404).json({ message: "Kayıt bulunamadı" });
    const me = String(req.userId);
    const involved = String(f.fromUser) === me || String(f.toUser) === me;
    if (!involved) return res.status(403).json({ message: "Yetkisiz" });
    if (f.status === "accepted" || f.status === "pending") {
      await f.deleteOne();
      return res.status(204).send();
    }
    return res.status(400).json({ message: "Bu arkadaşlık kaydı silinemez" });
  } catch (e) {
    next(e);
  }
}

async function activeStudying(req, res, next) {
  try {
    const ids = await friendUserIds(req.userId);
    if (!ids.length) return res.json([]);
    const sessions = await StudySession.find({
      user: { $in: ids },
      status: { $in: ["active", "paused"] },
    })
      .populate("user", "username email")
      .lean();
    const result = sessions.map((s) => ({
      sessionId: s._id,
      user: s.user,
      status: s.status,
      startedAt: s.startedAt,
      elapsedMs: computeElapsedMs(s),
    }));
    return res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { sendRequest, accept, rejectRequest, removeFriendship, listFriends, activeStudying };
