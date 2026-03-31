import { Link } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="page dashboard-page">
      <PageHeader title={`Merhaba ${user?.username || "Öğrenci"}!`} subtitle="Bugünün Hedefi: 5 Saat" />

      <div className="dashboard-shell">
        <section className="dashboard-topstats">
          <article className="topstat">
            <span>Bugünkü Hedef</span>
            <strong>5 saat</strong>
          </article>
          <article className="topstat">
            <span>Tamamlanan Görev</span>
            <strong>7 / 10</strong>
          </article>
          <article className="topstat">
            <span>Haftalık Seri</span>
            <strong>4 gün</strong>
          </article>
          <article className="topstat">
            <span>Odak Skoru</span>
            <strong>88</strong>
          </article>
        </section>

        <div className="dashboard-actions">
          <Link className="btn action-pill" to="/calisma-odasi">
            Hemen Çalış
          </Link>
          <Link className="btn action-pill alt" to="/plan-olustur">
            Yapay Zeka ile Plan Oluştur
          </Link>
          <Link className="btn action-pill soft" to="/bugun">
            Bugünün Görevleri
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card focus-card">
          <h3>Şu Anki Odak</h3>
          <p className="small muted">Matematik - Fonksiyonlar</p>
          <div className="focus-timer">00:30:15</div>
          <div className="focus-progress">
            <i style={{ width: "62%" }} />
          </div>
          <div className="row wrap mt dashboard-inline-actions">
            <Link className="btn small primary" to="/calisma-odasi">
              Çalışma Odasına Git
            </Link>
            <Link className="btn small" to="/takvim">
              Takvimi Aç
            </Link>
          </div>
        </section>

        <section className="dashboard-card">
          <h3>Bu Haftaki İlerleme</h3>
          <div className="progress-bars">
            <div><span>Pzt</span><i style={{ width: "55%" }} /></div>
            <div><span>Sal</span><i style={{ width: "68%" }} /></div>
            <div><span>Çar</span><i style={{ width: "74%" }} /></div>
            <div><span>Per</span><i style={{ width: "48%" }} /></div>
            <div><span>Cum</span><i style={{ width: "84%" }} /></div>
          </div>
        </section>

        <section className="dashboard-card">
          <h3>Gelecek Görevler</h3>
          <ul className="task-preview">
            <li>Tarih - Kurtuluş Savaşı</li>
            <li>Fizik - Hareket</li>
            <li>Türkçe - Paragraf</li>
          </ul>
          <Link className="link-btn mt" to="/bugun">
            Tüm görevleri gör
          </Link>
        </section>

        <section className="dashboard-card side-card">
          <h3>Akıllı Öneriler</h3>
          <ul className="tips-list">
            <li>Zor konuyu sabah ilk oturuma al.</li>
            <li>Pomodoro sonunda 5 dk aktif mola ver.</li>
            <li>Eksik kalan dersi haftalık plana sabitle.</li>
          </ul>
          <div className="dashboard-links">
            <Link className="link-btn" to="/analiz">
              Analiz sayfasına git
            </Link>
            <Link className="link-btn" to="/arkadaslar">
              Arkadaşlarını davet et
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
