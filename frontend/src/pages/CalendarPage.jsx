import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { formatDateShort } from "../utils/formatDate";

const TR_DAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

function padKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const mondayBased = startDow === 0 ? 6 : startDow - 1;
  const dim = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < mondayBased; i += 1) cells.push(null);
  for (let d = 1; d <= dim; d += 1) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursor, setCursor] = useState(() => new Date());
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState(() => searchParams.get("plan") || "");
  const [tasks, setTasks] = useState([]);
  const [selectedKey, setSelectedKey] = useState(() => padKey(new Date()));
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await api.plans();
      setPlans(list);
      const fromUrl = searchParams.get("plan");
      if (fromUrl) {
        setPlanId(fromUrl);
      } else if (list[0] && !planId) {
        setPlanId(list[0]._id);
      }
    })();
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

  const tasksByDay = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      const k = new Date(t.scheduledDate).toISOString().slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(t);
    }
    return map;
  }, [tasks]);

  const matrix = useMemo(
    () => buildMonthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const selectedTasks = tasksByDay.get(selectedKey) || [];

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  function onPickPlan(id) {
    setPlanId(id);
    const next = new URLSearchParams(searchParams);
    if (id) next.set("plan", id);
    else next.delete("plan");
    setSearchParams(next, { replace: true });
  }

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

  const title = cursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
    <div className="page wide">
      <PageHeader title="Takvim" subtitle="Planı seç; günlere tıklayarak görevleri gör ve tamamla." />
      <div className="row gap wrap">
        <label>
          Plan
          <select value={planId} onChange={(e) => onPickPlan(e.target.value)}>
            <option value="">—</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <Link className="btn" to="/plan-olustur">
          Yeni plan
        </Link>
      </div>

      <div className="calendar-nav row gap">
        <button type="button" className="btn small" onClick={prevMonth}>
          ‹ Önceki
        </button>
        <strong className="cal-title">{title}</strong>
        <button type="button" className="btn small" onClick={nextMonth}>
          Sonraki ›
        </button>
      </div>

      <div className="calendar-grid">
        <div className="cal-head">
          {TR_DAYS.map((d) => (
            <div key={d} className="cal-cell head">
              {d}
            </div>
          ))}
        </div>
        {matrix.map((week, wi) => (
          <div className="cal-row" key={wi}>
            {week.map((cell, ci) => {
              if (!cell) return <div className="cal-cell empty" key={`e-${ci}`} />;
              const key = padKey(cell);
              const count = (tasksByDay.get(key) || []).length;
              const done = (tasksByDay.get(key) || []).filter((t) => t.completed).length;
              const active = key === selectedKey;
              return (
                <button
                  type="button"
                  key={key}
                  className={`cal-cell day${active ? " selected" : ""}${count ? " has-tasks" : ""}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <span className="d-num">{cell.getDate()}</span>
                  {count ? (
                    <span className="d-badge">
                      {done}/{count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <section className="mt">
        <h3>{formatDateShort(selectedKey)} görevleri</h3>
        {selectedTasks.length ? (
          <ul className="task-items">
            {selectedTasks.map((t) => (
              <li key={t._id} className={`task ${t.completed ? "done" : ""}`}>
                <div>
                  <strong>{t.title}</strong>
                  <div className="muted small">~{t.estimatedMinutes} dk</div>
                </div>
                {!t.completed ? (
                  <button
                    type="button"
                    className="btn small"
                    disabled={busyId === t._id}
                    onClick={() => onComplete(t._id)}
                  >
                    Tamamla
                  </button>
                ) : (
                  <span className="badge">Tamam</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Bu gün için görev yok.</p>
        )}
      </section>
    </div>
  );
}
