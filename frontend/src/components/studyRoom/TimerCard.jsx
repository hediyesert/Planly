export function TimerCard({ elapsedMs, status }) {
  const total = Math.floor((elapsedMs || 0) / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");

  return (
    <div className="timer-card">
      <div className="timer-digits">
        {h}:{m}:{s}
      </div>
      <div className="muted small">Durum: {status}</div>
    </div>
  );
}
