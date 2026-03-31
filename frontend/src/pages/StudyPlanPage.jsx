import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { formatDateShort } from "../utils/formatDate";

export default function StudyPlanPage() {
  const { id } = useParams();
  const [plans, setPlans] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (id) {
          const d = await api.plan(id);
          if (!cancelled) setDetail(d);
        } else {
          const list = await api.plans();
          if (!cancelled) setPlans(list);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Yüklenemedi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">{error}</p>;

  if (id && detail) {
    return (
      <div className="page">
        <PageHeader title={detail.plan.title} subtitle={`İlerleme %${detail.plan.progressPercent}`} />
        <p className="muted">
          Hedef: {formatDateShort(detail.plan.targetDate)} · Günlük {detail.plan.dailyHours} sa ·{" "}
          {detail.plan.aiNotes}
        </p>
        <ol className="task-list">
          {detail.tasks.map((t) => (
            <li key={t._id} className={t.completed ? "done" : ""}>
              {formatDateShort(t.scheduledDate)} — {t.title}{" "}
              {t.completed ? <span className="badge">Tamamlandı</span> : null}
            </li>
          ))}
        </ol>
        <div className="row gap wrap">
          <Link to="/planlarim">Tüm planlar</Link>
          <Link to={`/takvim?plan=${detail.plan._id}`}>Takvimde gör</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Planlarım" />
      <ul className="list">
        {plans.map((p) => (
          <li key={p._id}>
            <Link to={`/plan/${p._id}`}>
              <strong>{p.title}</strong>
            </Link>
            <span className="muted small">
              {" "}
              %{p.progressPercent} · {formatDateShort(p.targetDate)}
            </span>
          </li>
        ))}
      </ul>
      {plans.length === 0 ? <p className="muted">Henüz plan yok. Plan oluştur sayfasından başlayın.</p> : null}
    </div>
  );
}
