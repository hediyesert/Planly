import { useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { formatDateShort } from "../utils/formatDate";

export default function TodayTasksPage() {
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [busyId, setBusyId] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await api.plans();
      if (cancelled) return;
      setPlans(list);
      setPlanId((prev) => prev || list[0]?._id || "");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    (async () => {
      const list = await api.tasks(planId);
      if (!cancelled) setTasks(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => new Date(t.scheduledDate).toISOString().slice(0, 10) === filterDay);
  }, [tasks, filterDay]);

  const selectedPlan = useMemo(() => plans.find((p) => p._id === planId), [plans, planId]);

  const weekBuckets = useMemo(() => {
    if (!tasks.length) return [];
    const ordered = [...tasks].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    const firstDay = new Date(ordered[0].scheduledDate);
    const start = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
    const map = new Map();
    for (const task of ordered) {
      const current = new Date(task.scheduledDate);
      const currentDay = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      const dayDiff = Math.floor((currentDay - start) / 86400000);
      const weekNo = Math.floor(dayDiff / 7) + 1;
      if (!map.has(weekNo)) map.set(weekNo, []);
      map.get(weekNo).push(task);
    }
    return Array.from(map.entries()).map(([weekNo, items]) => ({ weekNo, items }));
  }, [tasks]);

  const groupedDays = useMemo(() => {
    const currentWeek = weekBuckets.find((w) => w.weekNo === selectedWeek);
    const source = currentWeek?.items || filtered;
    const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const map = new Map();
    for (const task of source) {
      const d = new Date(task.scheduledDate);
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([dayKey, items]) => {
        const d = new Date(dayKey);
        return { dayKey, label: dayNames[d.getDay()], items };
      });
  }, [weekBuckets, selectedWeek, filtered]);

  useEffect(() => {
    if (!weekBuckets.length) {
      setSelectedWeek(1);
      return;
    }
    const has = weekBuckets.some((w) => w.weekNo === selectedWeek);
    if (!has) setSelectedWeek(weekBuckets[0].weekNo);
  }, [weekBuckets, selectedWeek]);

  async function onComplete(taskId) {
    setBusyId(taskId);
    try {
      await api.completeTask(taskId);
      const list = await api.tasks(planId);
      setTasks(list);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page today-page">
      <PageHeader title="Dashboard" subtitle="Üretilen çalışma planın" />
      <div className="today-shell">
        <div className="row gap wrap">
          <label>
            Plan
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} (%{p.progressPercent})
                </option>
              ))}
            </select>
          </label>
          <label>
            Gün
            <input type="date" value={filterDay} onChange={(e) => setFilterDay(e.target.value)} />
          </label>
        </div>

        <p className="muted small mt">
          {selectedPlan?.title || "Plan"} | %{selectedPlan?.progressPercent ?? 0} ilerleme | {tasks.length} görev
        </p>

        <section className="today-summary mt">
          <h3>Yapılacaklar</h3>
          <div className="week-tabs">
            {weekBuckets.map((w) => (
              <button
                key={w.weekNo}
                type="button"
                className={`week-tab ${selectedWeek === w.weekNo ? "active" : ""}`}
                onClick={() => setSelectedWeek(w.weekNo)}
              >
                Hafta {w.weekNo}
              </button>
            ))}
          </div>
          <p className="muted small">
            Tamamlanan: {tasks.filter((t) => t.completed).length}/{tasks.length}
          </p>
        </section>

        <section className="today-days">
          <h3>Günler</h3>
          {groupedDays.length ? (
            <div className="day-list">
              {groupedDays.map((day) => (
                <article key={day.dayKey} className="day-card">
                  <h4>{day.label}</h4>
                  <ul className="task-items today-task-items">
                    {day.items.map((task) => (
                      <li key={task._id} className={task.completed ? "task done" : "task"}>
                        <label className="today-checkline">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            disabled={busyId === task._id || task.completed}
                            onChange={() => onComplete(task._id)}
                          />
                          <span>
                            {task.title} <em className="muted small">({formatDateShort(task.scheduledDate)})</em>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Seçili hafta/gün için görev yok.</p>
          )}
        </section>
      </div>
    </div>
  );
}
