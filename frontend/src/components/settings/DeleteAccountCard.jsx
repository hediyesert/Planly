import { useState } from "react";
import { api } from "../../api/apiClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function DeleteAccountCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    setError("");
    if (confirmText !== "SIL") {
      setError('Kalıcı silmek için kutuya SIL yazın.');
      return;
    }
    setLoading(true);
    try {
      await api.deleteUser(user.id);
      logout();
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.message || "Silinemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card danger-zone">
      <h3>Hesabı sil</h3>
      <p className="muted small">Bu işlem geri alınamaz; tüm planlar, görevler ve oturumlar silinir.</p>
      {error ? <p className="error">{error}</p> : null}
      <label>
        Onay metni: SIL
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
      </label>
      <button type="button" className="btn danger" disabled={loading} onClick={onDelete}>
        Hesabı kalıcı sil
      </button>
    </div>
  );
}
