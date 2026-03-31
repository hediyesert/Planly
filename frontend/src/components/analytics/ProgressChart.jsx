export function ProgressChart({ dailyBreakdown }) {
  if (!dailyBreakdown?.length) return <p className="muted">Veri yok.</p>;
  const max = Math.max(1, ...dailyBreakdown.map((d) => d.completedTasks + d.incompleteTasks));

  return (
    <div className="chart">
      {dailyBreakdown.map((d) => (
        <div key={d.date} className="chart-row">
          <span className="chart-label">{d.date}</span>
          <div className="chart-bars">
            <div
              className="bar done"
              style={{ width: `${(d.completedTasks / max) * 100}%` }}
              title={`Tamamlanan: ${d.completedTasks}`}
            />
            <div
              className="bar todo"
              style={{ width: `${(d.incompleteTasks / max) * 100}%` }}
              title={`Kalan: ${d.incompleteTasks}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
