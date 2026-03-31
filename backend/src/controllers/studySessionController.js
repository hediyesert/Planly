const StudySession = require("../models/StudySession");
const StudyPlan = require("../models/StudyPlan");
const Task = require("../models/Task");
const Friend = require("../models/Friend");
const { computeElapsedMs, applyPause, applyResume } = require("../services/timerService");

async function getFriendIds(userId) {
  const rows = await Friend.find({
    status: "accepted",
    $or: [{ fromUser: userId }, { toUser: userId }],
  }).lean();
  return rows.map((r) => (String(r.fromUser) === String(userId) ? r.toUser : r.fromUser));
}

function broadcastStudyState(io, userId, friendIds, payload) {
  if (!io) return;
  for (const fid of friendIds) {
    io.to(`user:${fid}`).emit("friend:study", { userId, ...payload });
  }
}

async function startSession(req, res, next) {
  try {
    const { studyPlanId, taskId } = req.body;
    if (studyPlanId) {
      const plan = await StudyPlan.findOne({ _id: studyPlanId, user: req.userId });
      if (!plan) return res.status(404).json({ message: "Plan bulunamadı" });
    }
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, user: req.userId });
      if (!task) return res.status(404).json({ message: "Görev bulunamadı" });
    }
    const previous = await StudySession.find({
      user: req.userId,
      status: { $in: ["active", "paused"] },
    });
    const end = new Date();
    for (const s of previous) {
      if (s.status === "paused" && s.pausedAt) {
        s.totalPausedMs = (s.totalPausedMs || 0) + (end.getTime() - new Date(s.pausedAt).getTime());
        s.pausedAt = null;
      }
      s.status = "completed";
      s.endedAt = end;
      s.totalFocusMs = computeElapsedMs({
        ...s.toObject(),
        endedAt: end,
        status: "completed",
        pausedAt: null,
      });
      await s.save();
    }
    const session = await StudySession.create({
      user: req.userId,
      studyPlan: studyPlanId || null,
      task: taskId || null,
      status: "active",
      startedAt: new Date(),
    });
    const io = req.app.get("io");
    const friends = await getFriendIds(req.userId);
    broadcastStudyState(io, req.userId, friends, {
      session: session.toObject(),
      elapsedMs: 0,
    });
    return res.status(201).json(session);
  } catch (e) {
    next(e);
  }
}

async function getCurrentSession(req, res, next) {
  try {
    const session = await StudySession.findOne({
      user: req.userId,
      status: { $in: ["active", "paused"] },
    }).sort({ startedAt: -1 });
    return res.json(session || null);
  } catch (e) {
    next(e);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const session = await StudySession.findOne({ _id: req.params.sessionId, user: req.userId });
    if (!session) return res.status(404).json({ message: "Oturum bulunamadı" });
    if (session.status === "completed") {
       return res.status(400).json({ message: "Oturum zaten tamamlandı" });
    }
    if (status === "paused") applyPause(session);
    else if (status === "active") applyResume(session);
    else {
      return res.status(400).json({ message: "Geçersiz durum" });
    }
    await session.save();
    const io = req.app.get("io");
    const friends = await getFriendIds(req.userId);
    broadcastStudyState(io, req.userId, friends, {
      session: session.toObject(),
      elapsedMs: computeElapsedMs(session),
    });
    return res.json(session);
  } catch (e) {
    next(e);
  }
}

async function finishSession(req, res, next) {
  try {
    const session = await StudySession.findOne({ _id: req.params.sessionId, user: req.userId });
    if (!session) return res.status(404).json({ message: "Oturum bulunamadı" });
    if (session.status === "completed") {
      return res.json(session);
    }
    if (session.status === "paused" && session.pausedAt) {
      session.totalPausedMs = (session.totalPausedMs || 0) + (Date.now() - new Date(session.pausedAt).getTime());
      session.pausedAt = null;
    }
    session.status = "completed";
    session.endedAt = new Date();
    session.totalFocusMs = computeElapsedMs({
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: "completed",
      totalPausedMs: session.totalPausedMs,
      pausedAt: null,
    });
    await session.save();
    const io = req.app.get("io");
    const friends = await getFriendIds(req.userId);
    broadcastStudyState(io, req.userId, friends, {
      session: session.toObject(),
      elapsedMs: session.totalFocusMs,
      finished: true,
    });
    return res.json(session);
  } catch (e) {
    next(e);
  }
}

module.exports = { startSession, getCurrentSession, updateStatus, finishSession };
