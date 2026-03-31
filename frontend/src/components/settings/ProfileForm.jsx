import { useState } from "react";
import { api } from "../../api/apiClient";
import { useAuth } from "../../hooks/useAuth";
import { setAuth, getToken } from "../../utils/storage";

export function ProfileForm() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.updateMe({ username, email });
      setUser(res.user);
      setAuth(getToken(), res.user);
      setMessage("Profil güncellendi.");
    } catch (err) {
      setError(err.message || "Güncellenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h3>Profil</h3>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <label>
        Kullanıcı adı
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label>
        E-posta
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <button type="submit" disabled={loading}>
        Kaydet
      </button>
    </form>
  );
}
