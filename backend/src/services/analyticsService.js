const Task = require("../models/Task");
const StudySession = require("../models/StudySession");

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function endOfWeek(start) {
  const e = new Date(start);
  e.setDate(e.getDate() + 7);
  return e;
}

async function buildWeeklyAnalytics(userId) {
  const now = new Date();
  const ws = startOfWeek(now);
  const we = endOfWeek(ws);

  const tasksInWeek = await Task.find({
    user: userId,
    scheduledDate: { $gte: ws, $lt: we },
  }).lean();

  const completed = tasksInWeek.filter((t) => t.completed);
  const incomplete = tasksInWeek.filter((t) => !t.completed);

  const sessions = await StudySession.find({
    user: userId,
    startedAt: { $gte: ws, $lt: we },
    status: "completed",
  }).lean();

  const totalFocusMs = sessions.reduce((sum, s) => sum + (s.totalFocusMs || 0), 0);

  const byDay = {};
  for (let i = 0; i < 7; i++) {
    const day = new Date(ws);
    day.setDate(day.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    byDay[key] = { completed: 0, incomplete: 0, focusMs: 0 };
  }
  for (const t of tasksInWeek) {
    const key = new Date(t.scheduledDate).toISOString().slice(0, 10);
    if (!byDay[key]) continue;
    if (t.completed) byDay[key].completed += 1;
    else byDay[key].incomplete += 1;
  }
  for (const s of sessions) {
    const key = new Date(s.startedAt).toISOString().slice(0, 10);
    if (byDay[key]) byDay[key].focusMs += s.totalFocusMs || 0;
  }

  const trend = Object.entries(byDay).map(([date, v]) => ({
    date,
    completedTasks: v.completed,
    incompleteTasks: v.incomplete,
    focusMinutes: Math.round(v.focusMs / 60000),
  }));

  return {
    weekStart: ws.toISOString(),
    weekEnd: we.toISOString(),
    tasksTotal: tasksInWeek.length,
    completedCount: completed.length,
    incompleteCount: incomplete.length,
    totalStudyMinutes: Math.round(totalFocusMs / 60000),
    dailyBreakdown: trend,
  };
}

module.exports = { buildWeeklyAnalytics, startOfWeek };
