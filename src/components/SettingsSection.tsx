import { useState } from "react";
import { getAdminPassword, setAdminPassword, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, KeyRound } from "lucide-react";

const SettingsSection = ({ onLogout }: { onLogout: () => void }) => {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleChange = () => {
    if (current !== getAdminPassword()) {
      toast.error("Current password is wrong");
      return;
    }
    if (newPass.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    setAdminPassword(newPass);
    setCurrent("");
    setNewPass("");
    toast.success("Password changed");
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="stat-card space-y-3">
        <div className="flex items-center gap-2 text-card-foreground">
          <KeyRound className="h-4 w-4" />
          <span className="text-sm font-semibold">Change Password</span>
        </div>
        <Input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        <Button size="sm" className="w-full" onClick={handleChange}>Update Password</Button>
      </div>
      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </div>
  );
};

export default SettingsSection;
