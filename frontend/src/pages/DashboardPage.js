import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";

function DashboardPage({ schedule }) {
  const planText = schedule?.plan || "";
  const meta = schedule?.meta;
  const weeks = schedule?.schedule?.weeks;
  const planStorageKey = useMemo(() => {
    const base = `${meta?.exam || "plan"}-${planText || ""}`;
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    return `completedTasks:${hash}`;
  }, [meta?.exam, planText]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [completedMap, setCompletedMap] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(false);

    // Öncelik: backend'den gelen plan içindeki kalıcı tikler
    if (schedule?.completedMap && typeof schedule.completedMap === "object") {
      setCompletedMap(schedule.completedMap);
      setIsHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(planStorageKey) || "{}";
      const parsed = JSON.parse(raw);
      setCompletedMap(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setCompletedMap({});
    } finally {
      setIsHydrated(true);
    }
  }, [planStorageKey, schedule?.completedMap]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(planStorageKey, JSON.stringify(completedMap));
  }, [completedMap, planStorageKey, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    // Tikleri backend'deki currentPlan içine de yaz.
    const token = window.localStorage.getItem("token");
    if (!token || !schedule || typeof schedule !== "object") return;

    const timeoutId = setTimeout(() => {
      const nextPlan = { ...schedule, completedMap };
      axios
        .put(
          apiUrl("/api/auth/me/plan"),
          { plan: nextPlan },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => {
          // Backend kaydı başarısız olursa UI akışı bozulmasın.
        });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [completedMap, schedule, isHydrated]);

  useEffect(() => {
    setActiveWeekIndex(0);
  }, [planStorageKey]);

  const activeWeek = useMemo(() => {
    if (!Array.isArray(weeks) || weeks.length === 0) return null;
    return weeks[Math.min(activeWeekIndex, weeks.length - 1)];
  }, [weeks, activeWeekIndex]);

  const completionStats = useMemo(() => {
    if (!activeWeek?.days) return null;
    const items = activeWeek.days.flatMap((d) => (d.items || []).map((i) => i));
    const doneCount = items.filter((i) => completedMap?.[i.id]).length;
    return { itemsCount: items.length, doneCount };
  }, [activeWeek, completedMap]);
  const doneCount = completionStats?.doneCount ?? 0;

  const toggleComplete = (id) => {
    if (!id) return;
    setCompletedMap((prev) => ({ ...prev, [id]: !prev?.[id] }));
  };

  useEffect(() => {
    if (!completionStats) return;
    const token = window.localStorage.getItem("token");
    if (!token) return;

    axios
      .post(
        apiUrl("/api/analytics/progress"),
        { completedTasksSnapshot: doneCount },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch(() => {
        // Analiz kaydı başarısız olursa UI akışı etkilenmesin.
      });
  }, [completionStats, doneCount]);

  return (
    <div className="container-center">
      <div className="card">
        <div className="topbar">
          <div>
            <div className="subtitle">Üretilen çalışma planın</div>
            <h2 className="title" style={{ marginBottom: 0 }}>
              Dashboard
            </h2>
          </div>
        </div>

        {meta && (
          <div className="muted" style={{ marginBottom: 10 }}>
            {meta.exam} | {meta.hours} saat/gün | {meta.subjectsCount} ders |{" "}
            {meta.topicsCount} topic
            {meta.generator ? ` | ${meta.generator}` : ""}
          </div>
        )}

        {Array.isArray(weeks) && weeks.length > 0 ? (
          <>
            <div className="section-title" style={{ marginBottom: 8 }}>
              Yapılacaklar
            </div>

            <div className="actions" style={{ marginTop: 0 }}>
              {weeks.map((w, idx) => (
                <button
                  key={w.week || idx}
                  className={
                    idx === activeWeekIndex ? "btn btn-primary" : "btn btn-secondary"
                  }
                  onClick={() => setActiveWeekIndex(idx)}
                  type="button"
                >
                  Hafta {w.week || idx + 1}
                </button>
              ))}
            </div>

            {completionStats && (
              <div className="muted" style={{ marginTop: 12 }}>
                Tamamlanan: {completionStats.doneCount}/{completionStats.itemsCount}
              </div>
            )}

            <div className="section-title">Günler</div>
            <div className="stack" style={{ marginTop: 10 }}>
              {(activeWeek?.days || []).map((day) => (
                <div key={day.day} className="select-card day-card">
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>{day.day}</div>
                  {(day.items || []).map((item) => {
                    const checked = !!completedMap?.[item.id];
                    return (
                      <label
                        key={item.id}
                        className="task-row"
                        style={{ opacity: checked ? 0.75 : 1 }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleComplete(item.id)}
                        />
                        <span className="task-label">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="section-title">Plan</div>
            {planText ? <div className="pre">{planText}</div> : <div className="muted">Henüz plan üretilmedi.</div>}
          </>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;