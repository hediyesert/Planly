import { formatDateShort } from "../../utils/formatDate";

export function PlanPreview({ plan, tasks }) {
  if (!plan) return null;
  return (
    <div className="preview">
      <h3>{plan.title}</h3>
      <p className="muted">
        İlerleme: %{plan.progressPercent} · Hedef: {formatDateShort(plan.targetDate)} · {plan.aiNotes}
      </p>
      <ol className="task-preview">
        {tasks?.slice(0, 12).map((t) => (
          <li key={t._id} className={t.completed ? "done" : ""}>
            <strong>{formatDateShort(t.scheduledDate)}</strong> — {t.title} ({t.estimatedMinutes} dk)
          </li>
        ))}
      </ol>
      {tasks?.length > 12 ? <p className="muted small">+{tasks.length - 12} görev daha…</p> : null}
    </div>
  );
}
