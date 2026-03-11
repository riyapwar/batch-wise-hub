import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const PageShell = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary px-4 py-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary-foreground">{title}</h1>
          {action}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
};

export default PageShell;
