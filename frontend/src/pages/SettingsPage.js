import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";

function SettingsPage({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = window.localStorage.getItem("token");

  const apiAuthMe = async () => {
    const res = await axios.get(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.user || null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const u = await apiAuthMe();
        setUser(u);
        setUsername(u?.username || "");
        setEmail(u?.email || "");
      } catch (e) {
        setError(e?.response?.data?.message || "Kullanıcı bilgileri alınamadı");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    setError("");
    try {
      const res = await axios.put(
        apiUrl("/api/auth/me"),
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nextToken = res.data?.token;
      if (nextToken) window.localStorage.setItem("token", nextToken);
      setUser(res.data?.user || user);
    } catch (e) {
      setError(e?.response?.data?.message || "Profil güncellenemedi");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor");
      return;
    }
    try {
      const res = await axios.put(
        apiUrl("/api/auth/me/password"),
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nextToken = res.data?.token;
      if (nextToken) window.localStorage.setItem("token", nextToken);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e?.response?.data?.message || "Şifre değiştirilemedi");
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    const ok = window.confirm("Hesabını tamamen silmek istiyor musun?");
    if (!ok) return;
    try {
      await axios.delete(apiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.localStorage.removeItem("token");
      onLogout?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Hesap silinemedi");
    }
  };

  const friends = user?.friends || [];

  const handleRemoveFriend = async (friendName) => {
    setError("");
    try {
      const encoded = encodeURIComponent(friendName);
      const res = await axios.delete(
        apiUrl(`/api/auth/me/friends/${encoded}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...(prev || {}), friends: res.data?.friends || [] }));
    } catch (e) {
      setError(e?.response?.data?.message || "Arkadaş çıkarılamadı");
    }
  };

  if (loading) {
    return (
      <div className="container-center">
        <div className="card card--small">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container-center">
      <div className="card">
        <div className="topbar">
          <div>
            <div className="subtitle">Kullanıcı ayarları</div>
            <h2 className="title" style={{ marginBottom: 0 }}>
              Profil
            </h2>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="section-title">Profil Düzenle</div>
        <div className="stack">
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Kullanıcı adı</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="label">E-posta</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={handleSaveProfile}>
              Kaydet
            </button>
          </div>
        </div>

        <div className="section-title">Şifre Değiştir</div>
        <div className="stack">
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Mevcut şifre</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="label">Yeni şifre</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="label">Yeni şifre (tekrar)</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={handleChangePassword}>
              Şifreyi Güncelle
            </button>
          </div>
        </div>

        <div className="section-title">Arkadaşlar</div>
        {friends.length === 0 ? (
          <div className="muted">Henüz arkadaş eklenmemiş.</div>
        ) : (
          <div className="grid-cards">
            {friends.map((f) => (
              <div key={f} className="select-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 900 }}>{f}</div>
                  <button className="btn btn-danger" onClick={() => handleRemoveFriend(f)}>
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-title">Hesap Sil</div>
        <div className="actions">
          <button className="btn btn-danger" onClick={handleDeleteAccount}>
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

