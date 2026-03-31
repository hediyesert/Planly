import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

export default function WeeklyAnalysisPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWeekly = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.analyticsWeekly();
      setData(res);
    } catch (e) {
      setError(e.message || "Analiz alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeekly();
  }, [loadWeekly]);

  const analytics = useMemo(() => {
    if (!data) return null;
    const activeDays = (data.dailyBreakdown || []).filter((d) => d.completedTasks + d.incompleteTasks > 0).length;
    const mostProductive = [...(data.dailyBreakdown || [])]
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .find((d) => d.completedTasks > 0);
    const productivityScore = Math.round(
      ((data.completedCount || 0) * 2 + (data.totalStudyMinutes || 0) / 10) / Math.max(1, activeDays),
    );
    return { activeDays, mostProductive, productivityScore };
  }, [data]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page analytics-page">
      <PageHeader
        title="Haftalık Analiz"
        subtitle={data ? `Performans özeti · ${formatDate(data.weekStart)} — ${formatDate(data.weekEnd)}` : ""}
      />
      {error ? <p className="error">{error}</p> : null}
      {data ? (
        <section className="analytics-shell">
          <div className="analytics-head">
            <h3>Performans özeti</h3>
            <button type="button" className="btn analytics-refresh" onClick={loadWeekly}>
              Yenile
            </button>
          </div>

          <div className="analytics-stats">
            <div className="analytics-stat">
              <span>Toplam Tamamlanan Görev</span>
              <strong>{data.completedCount}</strong>
            </div>
            <div className="analytics-stat">
              <span>Toplam Çalışma Süresi</span>
              <strong>
                {Math.floor((data.totalStudyMinutes || 0) / 60)}s {(data.totalStudyMinutes || 0) % 60}dk
              </strong>
            </div>
            <div className="analytics-stat">
              <span>Aktif Gün</span>
              <strong>{analytics?.activeDays || 0}/7</strong>
            </div>
            <div className="analytics-stat">
              <span>Üretkenlik Skoru</span>
              <strong>{analytics?.productivityScore || 0}</strong>
            </div>
          </div>

          <section className="mt">
            <h3>Günlük Dağılım</h3>
            <ul className="analytics-days">
              {(data.dailyBreakdown || []).map((d) => (
                <li key={d.date}>
                  <strong>{d.date}</strong>
                  <span>
                    {d.completedTasks} görev · {d.studyMinutes || 0} dk
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt">
            <h3>En Verimli Gün</h3>
            <div className="analytics-best">
              {analytics?.mostProductive ? (
                <p>
                  <strong>{analytics.mostProductive.date}</strong> · {analytics.mostProductive.completedTasks} görev
                  tamamlandı
                </p>
              ) : (
                <p className="muted">Bu hafta henüz tamamlanan görev yok.</p>
              )}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
