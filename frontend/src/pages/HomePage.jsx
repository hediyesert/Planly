import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="page">
      <h1>Planly</h1>
      <p className="lead">Ders çalışma planını oluştur, takip et, arkadaşlarınla motive ol.</p>
      {isAuthenticated ? (
        <Link className="btn primary" to="/panel">
          Panele git
        </Link>
      ) : (
        <div className="row">
          <Link className="btn primary" to="/kayit">
            Üye ol
          </Link>
          <Link className="btn" to="/giris">
            Giriş yap
          </Link>
        </div>
      )}
    </div>
  );
}
