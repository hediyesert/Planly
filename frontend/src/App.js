import { useState } from "react";

import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import StudyWithFriendsPage from "./pages/StudyWithFriendsPage";
import SettingsPage from "./pages/SettingsPage";
import WeeklyAnalysisPage from "./pages/WeeklyAnalysisPage";
import planlyBrandLogo from "./assets/planly-mark.png";

function App() {
  const [page, setPage] = useState(1);
  const [aiSchedule, setAiSchedule] = useState(null);

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setPage(1);
    setAiSchedule(null);
  };
  const renderMainPage = () => {
    if (page === 2) {
      return (
        <OnboardingPage
          onNext={(scheduleData) => {
            setAiSchedule(scheduleData);
            setPage(3);
          }}
        />
      );
    }

    if (page === 3) {
      return <DashboardPage schedule={aiSchedule} />;
    }

    if (page === 4) {
      return <StudyWithFriendsPage />;
    }

    if (page === 5) {
      return <SettingsPage onLogout={handleLogout} />;
    }

    return <WeeklyAnalysisPage />;
  };

  return (
    <>
      {page === 1 && (
        <AuthPage
          onNext={(user) => {
            const savedPlan = user?.currentPlan || null;
            if (savedPlan) {
              setAiSchedule(savedPlan);
              setPage(3);
              return;
            }
            setPage(2);
          }}
        />
      )}

      {page !== 1 && (
        <div className="app-shell">
          <header className="app-navbar">
            <div className="app-navbar-inner">
              <div className="app-navbar-brand">
                <img
                  src={planlyBrandLogo}
                  alt="Planly"
                  className="app-logo app-logo--nav"
                />
              </div>

              <nav className="app-menu app-menu--bar" aria-label="Ana menü">
                <button
                  type="button"
                  className={`app-menu-item ${page === 3 ? "active" : ""}`}
                  onClick={() => setPage(3)}
                >
                  Program
                </button>
                <button
                  type="button"
                  className={`app-menu-item ${page === 2 ? "active" : ""}`}
                  onClick={() => setPage(2)}
                >
                  Sınav ve Konular
                </button>
                <button
                  type="button"
                  className={`app-menu-item ${page === 4 ? "active" : ""}`}
                  onClick={() => setPage(4)}
                >
                  Canlı Oda
                </button>
                <button
                  type="button"
                  className={`app-menu-item ${page === 5 ? "active" : ""}`}
                  onClick={() => setPage(5)}
                >
                  Kullanıcı Ayarları
                </button>
                <button
                  type="button"
                  className={`app-menu-item ${page === 6 ? "active" : ""}`}
                  onClick={() => setPage(6)}
                >
                  Haftalık Analiz
                </button>
              </nav>

              <button
                type="button"
                className="btn btn-nav-logout"
                onClick={handleLogout}
              >
                Çıkış
              </button>
            </div>
          </header>

          <main className="app-content">{renderMainPage()}</main>
        </div>
      )}
    </>
  );
}

export default App;