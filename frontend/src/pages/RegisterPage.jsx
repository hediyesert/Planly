import { RegisterForm } from "../components/auth/RegisterForm";
import { PageHeader } from "../components/common/PageHeader";

export default function RegisterPage() {
  return (
    <div className="page narrow">
      <PageHeader title="Üye ol" subtitle="Kullanıcı adı, e-posta ve şifre ile kayıt" />
      <RegisterForm />
    </div>
  );
}
