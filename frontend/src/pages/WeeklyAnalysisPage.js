import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";

function WeeklyAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const token = window.localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(apiUrl("/api/analytics/weekly"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Analiz verisi alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bestDay = useMemo(() => {
    const daily = data?.daily || [];
    if (daily.length === 0) return null;
    return [...daily].sort((a, b) => b.studyMinutes - a.studyMinutes)[0];
  }, [data]);

  if (loading) {
    return (
      <div className="container-center">
        <div className="card">Haftalık analiz yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container-center">
      <div className="card">
        <div className="topbar">
          <div>
            <div className="subtitle">Performans özeti</div>
            <h2 className="title" style={{ marginBottom: 0 }}>
              Haftalık Analiz
            </h2>
          </div>
          <button className="btn btn-secondary" onClick={fetchData}>
            Yenile
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="select-card analysis-card-yellow">
            <div className="muted">Toplam Tamamlanan Görev</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>
              {data?.totals?.completedTasks || 0}
            </div>
          </div>

          <div className="select-card analysis-card-yellow">
            <div className="muted">Toplam Çalışma Süresi</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>
              {Math.floor((data?.totals?.studyMinutes || 0) / 60)}s{" "}
              {(data?.totals?.studyMinutes || 0) % 60}dk
            </div>
          </div>

          <div className="select-card analysis-card-yellow">
            <div className="muted">Aktif Gün</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{data?.activeDays || 0}/7</div>
          </div>

          <div className="select-card analysis-card-yellow">
            <div className="muted">Üretkenlik Skoru</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{data?.productivityScore || 0}</div>
          </div>
        </div>

        <div className="section-title">Günlük Dağılım</div>
        <div className="stack">
          {(data?.daily || []).map((d) => (
            <div key={d.dateKey} className="select-card analysis-card-blue">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>{d.day}</div>
                <div className="muted">
                  {d.completedTasks} görev · {Math.floor(d.studyMinutes / 60)}s {d.studyMinutes % 60}dk
                </div>
              </div>
            </div>
          ))}
        </div>

        {bestDay && (
          <>
            <div className="section-title">En Verimli Gün</div>
            <div className="pre">
              {bestDay.day} günü {Math.floor(bestDay.studyMinutes / 60)} saat{" "}
              {bestDay.studyMinutes % 60} dakika çalışmışsın. Harika!
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WeeklyAnalysisPage;

