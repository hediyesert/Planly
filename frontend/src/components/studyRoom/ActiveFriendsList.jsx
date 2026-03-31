import { TimerCard } from "./TimerCard";

function fmt(ms) {
  const t = Math.floor((ms || 0) / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m} dk ${s} sn`;
}

export function ActiveFriendsList({ entries }) {
  if (!entries?.length) return <p className="muted">Şu an çalışan arkadaş yok.</p>;
  return (
    <ul className="friends-active">
      {entries.map((row) => (
        <li key={row.sessionId}>
          <strong>{row.user?.username}</strong>
          <span className="muted small"> — {row.status}</span>
          <div className="muted small">Süre: {fmt(row.elapsedMs)}</div>
        </li>
      ))}
    </ul>
  );
}
