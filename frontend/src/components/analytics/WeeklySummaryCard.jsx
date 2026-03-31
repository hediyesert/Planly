export function WeeklySummaryCard({ data }) {
  if (!data) return null;
  return (
    <div className="summary-grid">
      <div className="stat">
        <span className="muted small">Tamamlanan görev</span>
        <strong>{data.completedCount}</strong>
      </div>
      <div className="stat">
        <span className="muted small">Tamamlanmayan</span>
        <strong>{data.incompleteCount}</strong>
      </div>
      <div className="stat">
        <span className="muted small">Toplam çalışma (dk)</span>
        <strong>{data.totalStudyMinutes}</strong>
      </div>
      <div className="stat">
        <span className="muted small">Toplam görev</span>
        <strong>{data.tasksTotal}</strong>
      </div>
    </div>
  );
}
