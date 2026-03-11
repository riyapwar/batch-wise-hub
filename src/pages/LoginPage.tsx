import { useState } from "react";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const LoginPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (login(password)) {
      onSuccess();
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          className="space-y-3"
        >
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Button className="w-full" type="submit">Login</Button>
        </form>
        <p className="text-[10px] text-muted-foreground">Default password: admin123</p>
      </div>
    </div>
  );
};

export default LoginPage;
