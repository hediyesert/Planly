import { TaskItem } from "./TaskItem";

export function DailyTaskList({ tasks, onComplete, busyId }) {
  if (!tasks?.length) return <p className="muted">Bu plan için görev yok.</p>;
  return (
    <ul className="task-items">
      {tasks.map((t) => (
        <TaskItem key={t._id} task={t} onComplete={onComplete} busy={busyId === t._id} />
      ))}
    </ul>
  );
}
