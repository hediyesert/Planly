import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Sayfa bulunamadı.</p>
      <Link to="/">Ana sayfa</Link>
    </div>
  );
}
