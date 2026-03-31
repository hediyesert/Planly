export function TopicSelector({ subjects, selected, onToggle }) {
  if (!subjects?.length) return <p className="muted">Önce sınav seçin.</p>;
  return (
    <div className="topic-tree builder-section">
      <h3>2) Konu Seç</h3>
      <p className="muted small">Toplam konu: {subjects.length}</p>
      {subjects.map((s) => (
        <section key={s.subjectName} className="subject-block topic-box">
          <h4 className="subject-title">{s.subjectName}</h4>
          <ul className="topic-list">
            {s.topics.map((t) => (
              <li key={t.id}>
                <label className="topic-check">
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => onToggle(t.id)}
                  />
                  <span>{t.name}</span>
                </label>
                {t.subtopics?.length ? (
                  <ul className="sub topic-sublist">
                    {t.subtopics.map((st) => (
                      <li key={st.id}>
                        <label className="topic-check">
                          <input
                            type="checkbox"
                            checked={selected.has(st.id)}
                            onChange={() => onToggle(st.id)}
                          />
                          <span>{st.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
