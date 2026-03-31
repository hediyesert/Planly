import { LoginForm } from "../components/auth/LoginForm";
import { PageHeader } from "../components/common/PageHeader";

export default function LoginPage() {
  return (
    <div className="page narrow">
      <PageHeader title="Giriş" subtitle="Hesabınızla devam edin" />
      <LoginForm />
    </div>
  );
}
