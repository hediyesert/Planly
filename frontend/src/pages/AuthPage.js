import { useState } from "react";
import axios from "axios";
import { apiUrl } from "../config";
import planlyBrandLogo from "../assets/planly-mark.png";

function AuthPage({ onNext }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    try {
      const response = await axios.post(
        apiUrl("/api/auth/register"),
        {
          username,
          email,
          password,
        }
      );
      const token = response?.data?.token;
      if (token) localStorage.setItem("token", token);
      onNext(response?.data?.user || null);
    } catch (e) {
      const message = e?.response?.data?.message || "Kayıt başarısız";
      setError(message);
    }
  };

  const handleLogin = async () => {
    setError("");
    try {
      const response = await axios.post(apiUrl("/api/auth/login"), {
        email,
        password,
      });
      const token = response?.data?.token;
      if (token) localStorage.setItem("token", token);
      onNext(response?.data?.user || null);
    } catch (e) {
      const message = e?.response?.data?.message || "Giriş başarısız";
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <div className="card card--small auth-card">
        <div className="auth-logo-wrap">
          <img
            src={planlyBrandLogo}
            alt="Planly"
            className="auth-logo"
          />
        </div>
        <p className="auth-lead">
          {mode === "login"
            ? "Devam etmek için e-posta ve şifreni gir."
            : "Yeni bir hesap oluşturmak için bilgilerini gir."}
        </p>

        <div className="auth-card-body">

        {mode === "register" && (
          <div className="field">
            <label className="label">Kullanıcı Adı</label>
            <input
              className="input"
              placeholder="örn. ediye"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="field">
          <label className="label">E-posta</label>
          <input
            className="input"
            placeholder="örn. ogrenci@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Şifre</label>
          <input
            className="input"
            type="password"
            placeholder="Şifren"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="error">{error}</div>}
        </div>

        <div className="actions auth-actions">
          {mode === "login" ? (
            <button
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={!email || !password}
            >
              Giriş Yap
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={!username || !email || !password}
            >
              Kayıt Ol
            </button>
          )}

          {mode === "login" ? (
            <button
              className="btn btn-secondary"
              onClick={() => setMode("register")}
            >
              Kayıt ol
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => setMode("login")}
            >
              Girişe dön
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;