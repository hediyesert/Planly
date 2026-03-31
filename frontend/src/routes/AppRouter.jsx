import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { StudySessionProvider } from "../context/StudySessionContext";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import PlanGeneratorPage from "../pages/PlanGeneratorPage";
import StudyPlanPage from "../pages/StudyPlanPage";
import TodayTasksPage from "../pages/TodayTasksPage";
import StudyRoomPage from "../pages/StudyRoomPage";
import FriendsPage from "../pages/FriendsPage";
import WeeklyAnalysisPage from "../pages/WeeklyAnalysisPage";
import CalendarPage from "../pages/CalendarPage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";

function Shell() {
  const { user, logout, isAuthenticated } = useAuth();
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || "P";
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Planly</div>
        {isAuthenticated ? (
          <div className="profile-chip">
            <div className="avatar">{userInitial}</div>
            <div className="profile-meta">
              <strong>{user?.username}</strong>
              <span>Hedef: Sınav Başarısı</span>
            </div>
          </div>
        ) : null}
        {isAuthenticated ? (
          <nav className="nav">
            <NavLink to="/panel" className={({ isActive }) => (isActive ? "active" : "")}>
              Ana Sayfa
            </NavLink>
            <NavLink to="/plan-olustur" className={({ isActive }) => (isActive ? "active" : "")}>
              Plan oluştur
            </NavLink>
            <NavLink to="/planlarim" className={({ isActive }) => (isActive ? "active" : "")}>
              Planlarım
            </NavLink>
            <NavLink to="/bugun" className={({ isActive }) => (isActive ? "active" : "")}>
              Bugünün görevleri
            </NavLink>
            <NavLink to="/takvim" className={({ isActive }) => (isActive ? "active" : "")}>
              Takvim
            </NavLink>
            <NavLink to="/calisma-odasi" className={({ isActive }) => (isActive ? "active" : "")}>
              Çalışma odası
            </NavLink>
            <NavLink to="/arkadaslar" className={({ isActive }) => (isActive ? "active" : "")}>
              Arkadaşlar
            </NavLink>
            <NavLink to="/analiz" className={({ isActive }) => (isActive ? "active" : "")}>
              İstatistikler
            </NavLink>
            <NavLink to="/ayarlar" className={({ isActive }) => (isActive ? "active" : "")}>
              Ayarlar
            </NavLink>
          </nav>
        ) : (
          <nav className="nav">
            <NavLink end to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Ana sayfa
            </NavLink>
            <NavLink to="/giris" className={({ isActive }) => (isActive ? "active" : "")}>
              Giriş
            </NavLink>
            <NavLink to="/kayit" className={({ isActive }) => (isActive ? "active" : "")}>
              Kayıt
            </NavLink>
          </nav>
        )}
        {isAuthenticated ? (
          <div className="userbox">
            <span className="muted small">{user?.username}</span>
            <button type="button" className="link-btn" onClick={logout}>
              Çıkış
            </button>
          </div>
        ) : null}
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppRouter() {
  return (
    <StudySessionProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/giris" element={<LoginPage />} />
          <Route path="/kayit" element={<RegisterPage />} />
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan-olustur"
            element={
              <ProtectedRoute>
                <PlanGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planlarim"
            element={
              <ProtectedRoute>
                <StudyPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <ProtectedRoute>
                <StudyPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bugun"
            element={
              <ProtectedRoute>
                <TodayTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/takvim"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calisma-odasi"
            element={
              <ProtectedRoute>
                <StudyRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arkadaslar"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analiz"
            element={
              <ProtectedRoute>
                <WeeklyAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ayarlar"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </StudySessionProvider>
  );
}
