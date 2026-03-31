import { PageHeader } from "../components/common/PageHeader";
import { ProfileForm } from "../components/settings/ProfileForm";
import { PasswordChangeForm } from "../components/settings/PasswordChangeForm";
import { DeleteAccountCard } from "../components/settings/DeleteAccountCard";

export default function SettingsPage() {
  return (
    <div className="page">
      <PageHeader title="Ayarlar" subtitle="Profil ve hesap yönetimi" />
      <ProfileForm />
      <div className="mt">
        <PasswordChangeForm />
      </div>
      <div className="mt">
        <DeleteAccountCard />
      </div>
    </div>
  );
}
