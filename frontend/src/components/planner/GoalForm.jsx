export function GoalForm({ dailyHours, onDailyHoursChange, targetDate, onTargetDateChange }) {
  const hourOptions = [1, 2, 3, 4, 5, 6, 8];
  return (
    <div className="builder-section">
      <h3>3) Hedef</h3>
      <div className="goal-layout">
        <div>
          <p className="small muted">Günlük çalışma (saat)</p>
          <div className="hour-options">
            {hourOptions.map((hour) => (
              <button
                key={hour}
                type="button"
                className={`hour-chip ${dailyHours === hour ? "active" : ""}`}
                onClick={() => onDailyHoursChange(hour)}
              >
                {hour} saat
              </button>
            ))}
          </div>
        </div>
        <label>
          Hedef tarihi
          <input
            type="date"
            value={targetDate}
            onChange={(e) => onTargetDateChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="hour-meter">
        <i style={{ width: `${Math.min(100, Math.max(8, (dailyHours / 8) * 100))}%` }} />
      </div>
      <p className="muted small">Seçilen süre: {dailyHours} saat</p>
      <label className="manual-hours">
        <input
          type="number"
          min={0.5}
          max={16}
          step={0.5}
          value={dailyHours}
          onChange={(e) => onDailyHoursChange(Number(e.target.value))}
          required
        />
        <span className="small muted">İstersen manuel saat girebilirsin</span>
      </label>
    </div>
  );
}
