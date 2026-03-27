import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";

function StudyWithFriendsPage() {
  const token = window.localStorage.getItem("token");

  const [friends, setFriends] = useState(() => []);
  const [newFriendName, setNewFriendName] = useState("");

  const [status, setStatus] = useState("idle"); // "idle" | "running" | "paused"
  const [elapsedMs, setElapsedMs] = useState(0); // paused/idle için güncel süre
  const [runningSince, setRunningSince] = useState(null); // running için başlangıç zamanı (ms)
  const [now, setNow] = useState(() => Date.now());

  const elapsedNow = (() => {
    if (status === "running" && runningSince) {
      return elapsedMs + (now - runningSince);
    }
    return elapsedMs;
  })();

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [status]);

  const syncMySession = async (nextStatus, nextElapsedMs, nextRunningSince) => {
    if (!token) return;
    await axios.put(
      apiUrl("/api/live/me"),
      {
        status: nextStatus,
        elapsedMs: nextElapsedMs,
        runningSince: nextRunningSince ? new Date(nextRunningSince).toISOString() : null,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleStart = () => {
    if (status === "running") return;
    const startedAt = Date.now();
    setRunningSince(startedAt);
    setStatus("running");
    syncMySession("running", elapsedMs, startedAt).catch(() => {});
  };

  const handlePause = () => {
    if (status !== "running") return;
    const pausedMs = elapsedNow;
    setElapsedMs(pausedMs);
    setRunningSince(null);
    setStatus("paused");
    syncMySession("paused", pausedMs, null).catch(() => {});
  };

  const handleFinish = () => {
    const minutes = Math.floor(elapsedNow / 60000);
    if (minutes > 0 && token) {
      axios
        .post(
          apiUrl("/api/analytics/progress"),
          { studyMinutesDelta: minutes },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => {
          // Analiz kaydı başarısız olursa timer akışı bozulmasın.
        });
    }

    setStatus("idle");
    setElapsedMs(0);
    setRunningSince(null);
    setNow(Date.now());
    syncMySession("idle", 0, null).catch(() => {});
  };

  const loadFriendsSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(apiUrl("/api/live/friends"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.friends || [];
      setFriends(list.map((f, i) => ({ id: `f-${i}-${f.name}`, name: f.name, session: f.session })));
    } catch {
      // sessiz
    }
  }, [token]);

  const handleAddFriend = () => {
    const name = newFriendName.trim();
    if (!name) return;

    const doAdd = async () => {
      await axios.post(
        apiUrl("/api/auth/me/friends"),
        { friendName: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadFriendsSessions();
      setNewFriendName("");
    };

    doAdd().catch(() => {
      // Basit MVP: hata varsa sessizce devam et.
    });
  };

  const sessionLabel =
    status === "idle" ? "Hazır" : status === "running" ? "Çalışıyor" : "Mola";

  const activeFriends = useMemo(() => friends, [friends]);

  const computeFriendElapsed = (session) => {
    const base = Number(session?.elapsedMs || 0);
    if (session?.status === "running" && session?.runningSince) {
      const started = new Date(session.runningSince).getTime();
      if (Number.isFinite(started)) return base + Math.max(0, now - started);
    }
    return base;
  };

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const meRes = await axios.get(apiUrl("/api/live/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mySession = meRes.data?.session || {};
        setStatus(mySession.status || "idle");
        setElapsedMs(Number(mySession.elapsedMs || 0));
        setRunningSince(mySession.runningSince ? new Date(mySession.runningSince).getTime() : null);

        await loadFriendsSessions();
      } catch {
        // sessiz
      }
    };
    load();

    const pollId = setInterval(() => {
      loadFriendsSessions();
    }, 3000);

    return () => clearInterval(pollId);
  }, [token, loadFriendsSessions]);

  return (
    <div className="container-center">
      <div className="card">
        <div className="topbar">
          <div>
            <div className="subtitle">Canlı çalışma odası</div>
            <h2 className="title" style={{ marginBottom: 0 }}>
              Live Study Room
            </h2>
          </div>
        </div>

        <div className="section-title">Oturum Durumu</div>
        <div className="muted" style={{ marginBottom: 10 }}>
          {sessionLabel} · Süre: <b>{formatTime(elapsedNow)}</b>
        </div>

        <div className="pre" style={{ textAlign: "center", fontSize: 34 }}>
          {formatTime(elapsedNow)}
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={handleStart} disabled={status === "running"}>
            Başla
          </button>

          <button className="btn btn-secondary" onClick={handlePause} disabled={status !== "running"}>
            Mola Ver
          </button>

          <button className="btn btn-danger" onClick={handleFinish} disabled={status === "idle"}>
            Çalışmayı Bitir
          </button>
        </div>

        <div className="section-title" style={{ marginTop: 22 }}>
          Arkadaş Ekle
        </div>
        <div className="grid-2" style={{ alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}>
            <label className="label">İsim</label>
            <input
              className="input"
              placeholder="örn. Ali"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFriend();
              }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleAddFriend} disabled={!newFriendName.trim()}>
            Ekle
          </button>
        </div>

        <div className="section-title" style={{ marginTop: 22 }}>
          Çalışanlar Listesi
        </div>
        {activeFriends.length === 0 ? (
          <div className="muted">Henüz kimse yok.</div>
        ) : (
          <div className="stack">
            {activeFriends.map((f) => (
              <div key={f.id} className="select-card worker-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{f.name}</div>
                  <div className="muted" style={{ fontWeight: 800 }}>
                    {f?.session?.status === "running" || f?.session?.status === "paused"
                      ? formatTime(computeFriendElapsed(f.session))
                      : "—"}
                  </div>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {f?.session?.status === "running"
                    ? "Şu an çalışıyor"
                    : f?.session?.status === "paused"
                      ? "Mola verdi"
                      : "Şu an çalışmıyor"}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudyWithFriendsPage;