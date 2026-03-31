import { useState } from "react";
import { api } from "../../api/apiClient";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setMessage("Şifre güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Şifre değiştirilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h3>Şifre değiştir</h3>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <label>
        Mevcut şifre
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      <label>
        Yeni şifre (en az 6 karakter)
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </button>
    </form>
  );
}
