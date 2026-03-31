import { useCallback, useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ExamTypeSelector } from "../components/planner/ExamTypeSelector";
import { TopicSelector } from "../components/planner/TopicSelector";
import { GoalForm } from "../components/planner/GoalForm";
import { PlanPreview } from "../components/planner/PlanPreview";
import { Link } from "react-router-dom";

export default function PlanGeneratorPage() {
  const [examTypes, setExamTypes] = useState([]);
  const [examTypeId, setExamTypeId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [dailyHours, setDailyHours] = useState(2);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.examTypes();
        if (!cancelled) setExamTypes(list);
      } catch {
        if (!cancelled) setError("Sınav türleri yüklenemedi");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!examTypeId) {
      setSubjects([]);
      setSelected(new Set());
      return;
    }
    let cancelled = false;
    setTopicsLoading(true);
    (async () => {
      try {
        const data = await api.topics(examTypeId);
        if (!cancelled) setSubjects(data.subjects || []);
      } catch {
        if (!cancelled) setSubjects([]);
      } finally {
        if (!cancelled) setTopicsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examTypeId]);

  const toggleTopic = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function onGenerate(e) {
    e.preventDefault();
    setError("");
    if (!examTypeId || selected.size === 0) {
      setError("En az bir konu seçin.");
      return;
    }
    if (!targetDate) {
      setError("Hedef tarih seçin.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.aiGenerate({
        examTypeId,
        topicIds: Array.from(selected),
        dailyHours,
        targetDate,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Plan oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page plan-page">
      <PageHeader title="Plan Oluştur" subtitle="AI destekli plan" />
      {error ? <p className="error">{error}</p> : null}
      {topicsLoading ? <LoadingSpinner label="Konular yükleniyor…" /> : null}
      <form className="form-stack plan-builder" onSubmit={onGenerate}>
        <ExamTypeSelector examTypes={examTypes} value={examTypeId} onChange={setExamTypeId} disabled={loading} />
        <TopicSelector subjects={subjects} selected={selected} onToggle={toggleTopic} />
        <GoalForm
          dailyHours={dailyHours}
          onDailyHoursChange={setDailyHours}
          targetDate={targetDate}
          onTargetDateChange={setTargetDate}
        />
        <button type="submit" className="btn primary plan-submit" disabled={loading}>
          {loading ? "Üretiliyor…" : "Plan Üret"}
        </button>
      </form>
      {result ? (
        <div className="card mt plan-result">
          <PlanPreview plan={result.plan} tasks={result.tasks} />
          <Link className="btn" to={`/plan/${result.plan._id}`}>
            Plan detayına git
          </Link>
        </div>
      ) : null}
    </div>
  );
}
