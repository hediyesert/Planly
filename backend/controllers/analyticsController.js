const jwt = require("jsonwebtoken");
const User = require("../models/User");
const WeeklyAnalytics = require("../models/WeeklyAnalytics");

const getJwtSecret = () => process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const getAuthUser = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = jwt.verify(token, getJwtSecret());
  const user = await User.findById(payload.sub);
  return user || null;
};

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getWeekStart = (baseDate) => {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0: pazar, 1: pazartesi
  const diff = day === 0 ? -6 : 1 - day; // pazartesiye çek
  d.setDate(d.getDate() + diff);
  return d;
};

const findOrCreateWeekDoc = async (userId, now) => {
  const weekStart = getWeekStart(now);
  let doc = await WeeklyAnalytics.findOne({ userId, weekStart });
  if (!doc) {
    doc = await WeeklyAnalytics.create({ userId, weekStart, dailyStats: [] });
  }
  return doc;
};

exports.recordProgress = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { completedTasksSnapshot, studyMinutesDelta } = req.body || {};
    const now = new Date();
    const todayKey = toDateKey(now);

    const doc = await findOrCreateWeekDoc(user._id, now);
    const idx = doc.dailyStats.findIndex((d) => d.dateKey === todayKey);
    if (idx === -1) {
      doc.dailyStats.push({ dateKey: todayKey, completedTasks: 0, studyMinutes: 0 });
    }
    const target = doc.dailyStats.find((d) => d.dateKey === todayKey);

    if (typeof completedTasksSnapshot === "number" && Number.isFinite(completedTasksSnapshot)) {
      target.completedTasks = Math.max(0, Math.floor(completedTasksSnapshot));
    }

    if (typeof studyMinutesDelta === "number" && Number.isFinite(studyMinutesDelta)) {
      target.studyMinutes = Math.max(0, target.studyMinutes + Math.floor(studyMinutesDelta));
    }

    await doc.save();

    return res.json({ message: "İlerleme kaydedildi" });
  } catch (err) {
    return res.status(500).json({ message: "İlerleme kaydedilemedi", error: err.message });
  }
};

exports.getWeeklyAnalysis = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const now = new Date();
    const weekStart = getWeekStart(now);
    const doc = await WeeklyAnalytics.findOne({ userId: user._id, weekStart }).lean();

    const days = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];
    const dateKeys = days.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return toDateKey(d);
    });

    const daily = dateKeys.map((k, i) => {
      const stat = (doc?.dailyStats || []).find((d) => d.dateKey === k);
      return {
        day: days[i],
        dateKey: k,
        completedTasks: stat?.completedTasks || 0,
        studyMinutes: stat?.studyMinutes || 0,
      };
    });

    const totals = daily.reduce(
      (acc, d) => ({
        completedTasks: acc.completedTasks + d.completedTasks,
        studyMinutes: acc.studyMinutes + d.studyMinutes,
      }),
      { completedTasks: 0, studyMinutes: 0 }
    );

    const activeDays = daily.filter((d) => d.studyMinutes > 0).length;
    const productivityScore = totals.completedTasks * 2 + Math.floor(totals.studyMinutes / 30);

    return res.json({
      weekStart: toDateKey(weekStart),
      daily,
      totals,
      activeDays,
      productivityScore,
    });
  } catch (err) {
    return res.status(500).json({ message: "Haftalık analiz alınamadı", error: err.message });
  }
};

