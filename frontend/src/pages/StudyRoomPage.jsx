import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { TimerCard } from "../components/studyRoom/TimerCard";
import { SessionControls } from "../components/studyRoom/SessionControls";
import { ActiveFriendsList } from "../components/studyRoom/ActiveFriendsList";
import { createSocket } from "../socket";

function computeClientElapsed(session) {
  if (!session?.startedAt) return 0;
  if (session.status === "completed") return session.totalFocusMs || 0;
  const now = Date.now();
  let pausedExtra = session.totalPausedMs || 0;
  if (session.status === "paused" && session.pausedAt) {
    pausedExtra += now - new Date(session.pausedAt).getTime();
  }
  return Math.max(0, now - new Date(session.startedAt).getTime() - pausedExtra);
}

export default function StudyRoomPage() {
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState("");
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [friends, setFriends] = useState([]);
  const [tick, setTick] = useState(0);

  const loadFriends = useCallback(async () => {
    try {
      const list = await api.activeStudying();
      setFriends(list);
    } catch {
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const list = await api.plans();
      setPlans(list);
      if (list[0]) setPlanId((p) => p || list[0]._id);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const current = await api.currentSession();
        if (cancelled || !current) return;
        setSession(current);
        if (current.studyPlan) {
          setPlanId((prev) => prev || String(current.studyPlan));
        }
      } catch {
        // No active session is a valid state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    const s = createSocket();
    if (!s) return undefined;
    s.connect();
    const onUpdate = () => loadFriends();
    s.on("friend:study", onUpdate);
    return () => {
      s.off("friend:study", onUpdate);
      s.disconnect();
    };
  }, [loadFriends]);

  useEffect(() => {
    if (!session || session.status === "completed") return undefined;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [session]);

  const elapsedMs = useMemo(() => computeClientElapsed(session), [session, tick]);
  const statusLabel =
    session?.status === "active" ? "Çalışıyor" : session?.status === "paused" ? "Molada" : "Hazır";

  async function onStart() {
    setBusy(true);
    try {
      const body = planId ? { studyPlanId: planId } : {};
      const s = await api.startSession(body);
      setSession(s);
    } finally {
      setBusy(false);
    }
  }

  async function onPause() {
    if (!session) return;
    setBusy(true);
    try {
      const s = await api.sessionStatus(session._id, "paused");
      setSession(s);
    } finally {
      setBusy(false);
    }
  }

  async function onResume() {
    if (!session) return;
    setBusy(true);
    try {
      const s = await api.sessionStatus(session._id, "active");
      setSession(s);
    } finally {
      setBusy(false);
    }
  }

  async function onFinish() {
    if (!session) return;
    setBusy(true);
    try {
      const s = await api.finishSession(session._id);
      setSession(s);
      await loadFriends();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page room-page">
      <PageHeader title="Live Study Room" subtitle="Canlı çalışma odası" />
      <div className="room-shell">
        <div className="room-top row gap wrap">
          <label className="grow">
            Plan (opsiyonel)
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">—</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn primary room-start"
            disabled={busy || (session && session.status !== "completed")}
            onClick={onStart}
          >
            Başla
          </button>
        </div>

        <section className="room-panel mt">
          <h3>Oturum Durumu</h3>
          <p className="muted"> {statusLabel} · Süre: {Math.floor(elapsedMs / 1000)} sn</p>
          {session && session.status !== "completed" ? (
            <>
              <TimerCard elapsedMs={elapsedMs} status={session.status} />
              <SessionControls
                session={session}
                onPause={onPause}
                onResume={onResume}
                onFinish={onFinish}
                loading={busy}
              />
            </>
          ) : session?.status === "completed" ? (
            <p className="muted">Son oturum tamamlandı. Toplam odak: {Math.round((session.totalFocusMs || 0) / 60000)} dk</p>
          ) : (
            <p className="muted">Yeni bir çalışma oturumu başlatabilirsin.</p>
          )}
        </section>

        <section className="room-panel mt">
          <h3>Çalışanlar Listesi</h3>
          <ActiveFriendsList entries={friends} />
        </section>
      </div>
    </div>
  );
}
