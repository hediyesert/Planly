export function SessionControls({ session, onPause, onResume, onFinish, loading }) {
  if (!session) {
    return null;
  }
  const paused = session.status === "paused";
  return (
    <div className="row gap wrap">
      {session.status === "active" ? (
        <button type="button" className="btn" disabled={loading} onClick={onPause}>
          Mola
        </button>
      ) : null}
      {paused ? (
        <button type="button" className="btn primary" disabled={loading} onClick={onResume}>
          Devam
        </button>
      ) : null}
      <button type="button" className="btn danger" disabled={loading} onClick={onFinish}>
        Çalışmayı bitir
      </button>
    </div>
  );
}
