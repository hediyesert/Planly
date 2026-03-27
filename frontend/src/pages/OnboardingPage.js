import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";

function OnboardingPage({ onNext }) {
  const [examsData, setExamsData] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});

  const [hours, setHours] = useState(4);
  const [targetDate, setTargetDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const normalizeExam = (exam) => {
    if (!exam || typeof exam !== "object") return null;

    // Bazı durumlarda DB'den gelen kayıt "sarmalanmış" gelebiliyor:
    // { _id: ..., 0: { name, subjects }, 1: ... } gibi.
    const candidate =
      exam.name || exam.subjects || exam.subjectsList || exam.Subjects
        ? exam
        : exam[0] && typeof exam[0] === "object"
          ? exam[0]
          : exam;

    const name =
      candidate.name ?? candidate.Name ?? candidate.examName ?? "";

    const subjectsRaw =
      candidate.subjects ??
      candidate.Subjects ??
      candidate.subjectsList ??
      [];

    const subjects = Array.isArray(subjectsRaw)
      ? subjectsRaw
          .map((s) => {
            if (typeof s === "string") return { name: s, topics: [] };
            if (!s || typeof s !== "object") return null;
            const subjectName = s.name ?? s.subjectName ?? s.title ?? "";
            const topicsRaw = s.topics ?? s.topic ?? s.subTopics ?? [];
            const topics = Array.isArray(topicsRaw) ? topicsRaw : [];
            return { name: subjectName, topics };
          })
          .filter(Boolean)
      : [];

    return { ...exam, name, subjects };
  };

  useEffect(() => {
    setLoadingExams(true);
    fetch(apiUrl("/api/exams"))
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setExamsData(list.map(normalizeExam).filter(Boolean));
      })
      .catch((err) => {
        console.error("Sınavları getirirken hata:", err);
        setExamsData([]);
      })
      .finally(() => setLoadingExams(false));
  }, []);

  const examSubjects = useMemo(() => {
    const subs = selectedExam?.subjects;
    if (!Array.isArray(subs)) return [];

    // Frontend'in beklediği format: [{ name: string, topics: string[] }]
    return subs
      .map((s) => {
        if (!s) return null;
        if (typeof s === "string") return { name: s, topics: [] };
        const subjectName = s.name ?? s.subjectName ?? s.title ?? "";
        const topicsRaw = s.topics ?? s.topic ?? [];
        const topics = Array.isArray(topicsRaw) ? topicsRaw : [];
        if (!subjectName) return null;
        return { name: subjectName, topics };
      })
      .filter(Boolean);
  }, [selectedExam]);

  const toggleSubject = (subjectName) => {
    setSelectedSubjects((prev) => {
      const exists = prev.includes(subjectName);
      const next = exists
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName];

      // Seçim kalktıysa topic'leri de temizle.
      setSelectedTopics((tpPrev) => {
        if (!exists) return tpPrev;
        const { [subjectName]: _, ...rest } = tpPrev;
        return rest;
      });

      return next;
    });
  };

  const toggleTopic = (subjectName, topic) => {
    setSelectedTopics((prev) => {
      const current = prev[subjectName] || [];
      const exists = current.includes(topic);
      const next = exists ? current.filter((t) => t !== topic) : [...current, topic];
      return { ...prev, [subjectName]: next };
    });
  };

  const handleSelectExam = (exam) => {
    const normalized = normalizeExam(exam);
    setSelectedExam(normalized);
    setSelectedSubjects([]);
    setSelectedTopics({});
    setError("");
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setError("");

    if (!selectedExam) {
      setError("Lütfen önce sınav seçin.");
      setIsGenerating(false);
      return;
    }

    if (selectedSubjects.length === 0) {
      setError("Lütfen en az bir konu seçin.");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/generate-schedule"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: selectedExam?.name,
          subjects: selectedSubjects,
          topics: selectedTopics,
          hours,
          deadline: targetDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Plan üretilemedi.");
        return;
      }

      const token = window.localStorage.getItem("token");
      if (token) {
        await axios.put(
          apiUrl("/api/auth/me/plan"),
          { plan: data },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {
          // Plan kaydı başarısız olursa UI akışı bozulmasın.
        });
      }
      onNext(data);
    } catch (err) {
      console.error("Plan üretirken hata:", err);
      setError("Plan üretilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hourOptions = [1, 2, 3, 4, 5, 6, 8];

  return (
    <div className="container-center">
      <div className="card">
        <div className="topbar">
          <div>
            <div className="subtitle">AI destekli plan</div>
            <h2 className="title" style={{ marginBottom: 0 }}>
              Plan Oluştur
            </h2>
          </div>
        </div>

        <div className="section-title">1) Sınav Seç</div>
        {!loadingExams && <div className="muted">Toplam sınav: {examsData.length}</div>}
        {loadingExams ? (
          <div className="muted">Sınavlar yükleniyor...</div>
        ) : examsData.length === 0 ? (
          <div className="muted">Sınav bulunamadı. DB’ye sınav ekleyin.</div>
        ) : (
          <div className="grid-cards">
            {examsData.map((exam) => {
              const isActive = selectedExam?.name === exam?.name;
              return (
                <button
                  key={exam._id || exam.name}
                  className={`select-card exam-card ${isActive ? "select-card--active" : ""}`}
                  onClick={() => handleSelectExam(exam)}
                  type="button"
                >
                  <div style={{ fontWeight: 800 }}>{exam?.name || "Sınav"}</div>
                </button>
              );
            })}
          </div>
        )}

        {selectedExam && (
          <>
            <div className="section-title">2) Konu Seç</div>
            <div className="muted">Toplam konu: {examSubjects.length}</div>
            {examSubjects.length === 0 ? (
              <div className="muted">
                Seçili sınavın konu listesi boş ya da formatı beklenmedik.
              </div>
            ) : (
              <div className="grid-2">
                {examSubjects.map((s) => {
                  const subjectName = s?.name;
                  const active = selectedSubjects.includes(subjectName);
                  return (
                    <label
                      key={subjectName}
                      className="select-card"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleSubject(subjectName)}
                        />
                        <div style={{ fontWeight: 800 }}>{subjectName}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="section-title">3) Alt Başlık (Topic) Seç</div>
            {selectedSubjects.length === 0 ? (
              <div className="muted">Önce konu seç.</div>
            ) : (
              <div className="stack">
                {selectedSubjects.map((subjectName) => {
                  const subject = examSubjects.find((x) => x?.name === subjectName);
                  const topics = subject?.topics || [];
                  const activeTopics = selectedTopics[subjectName] || [];
                  return (
                    <div key={subjectName} className="select-card">
                      <div style={{ fontWeight: 900, marginBottom: 10 }}>{subjectName}</div>
                      {topics.length === 0 ? (
                        <div className="muted">Bu konunun topic’i yok.</div>
                      ) : (
                        <div className="checkbox-list">
                          {topics.map((t) => {
                            const checked = activeTopics.includes(t);
                            return (
                              <label key={t} className="checkbox-item" style={{ cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleTopic(subjectName, t)}
                                />
                                <span>{t}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="section-title">4) Hedef</div>
            <div className="grid-2">
              <div className="field" style={{ margin: 0 }}>
                <label className="label">Günlük çalışma (saat)</label>
                <div className="actions" style={{ marginTop: 0 }}>
                  {hourOptions.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={hours === h ? "btn btn-primary" : "btn btn-secondary"}
                      onClick={() => setHours(h)}
                    >
                      {h} saat
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    className="input"
                    type="range"
                    min={1}
                    max={12}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                  <div className="muted">Seçilen süre: {hours} saat</div>
                </div>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">Hedef tarih</label>
                <input
                  className="input"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={handleGenerateSchedule}
                disabled={isGenerating}
              >
                {isGenerating ? "Plan Üretiliyor..." : "Plan Üret"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;