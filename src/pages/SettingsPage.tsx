import PageShell from "@/components/PageShell";
import SettingsSection from "@/components/SettingsSection";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <PageShell title="⚙️ Settings">
      <SettingsSection onLogout={() => navigate(0)} />
    </PageShell>
  );
};

export default SettingsPage;
