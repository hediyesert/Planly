function computeElapsedMs(session) {
  if (!session || !session.startedAt) return 0;
  const end = session.endedAt ? new Date(session.endedAt).getTime() : Date.now();
  let pausedExtra = session.totalPausedMs || 0;
  if (session.status === "paused" && session.pausedAt) {
    pausedExtra += Date.now() - new Date(session.pausedAt).getTime();
  }
  return Math.max(0, end - new Date(session.startedAt).getTime() - pausedExtra);
}

function applyPause(session) {
  if (session.status !== "active") return session;
  session.status = "paused";
  session.pausedAt = new Date();
  return session;
}

function applyResume(session) {
  if (session.status !== "paused") return session;
  if (session.pausedAt) {
    session.totalPausedMs = (session.totalPausedMs || 0) + (Date.now() - new Date(session.pausedAt).getTime());
  }
  session.pausedAt = null;
  session.status = "active";
  return session;
}

module.exports = { computeElapsedMs, applyPause, applyResume };
