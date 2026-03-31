export function ExamTypeSelector({ examTypes, value, onChange, disabled }) {
  return (
    <fieldset className="builder-fieldset">
      <legend>1) Sınav Seç</legend>
      <p className="muted small">Toplam sınav: {examTypes.length}</p>
      <div className="chip-grid">
        {examTypes.map((exam) => (
          <label key={exam._id} className={`choice-chip ${value === exam._id ? "active" : ""}`}>
            <input
              type="radio"
              name="examTypeId"
              value={exam._id}
              checked={value === exam._id}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required
            />
            <span>{exam.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
