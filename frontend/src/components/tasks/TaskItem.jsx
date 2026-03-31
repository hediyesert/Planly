import { formatDateShort } from "../../utils/formatDate";

export function TaskItem({ task, onComplete, busy }) {
  return (
    <li className={task.completed ? "task done" : "task"}>
      <div>
        <strong>{task.title}</strong>
        <div className="muted small">
          {formatDateShort(task.scheduledDate)} · ~{task.estimatedMinutes} dk
        </div>
      </div>
      {!task.completed ? (
        <button type="button" className="btn small" disabled={busy} onClick={() => onComplete(task._id)}>
          Tamamla
        </button>
      ) : (
        <span className="badge">Tamamlandı</span>
      )}
    </li>
  );
}
