import { useMemo } from "react";
import { getData, getTodayString } from "@/lib/store";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import PageShell from "@/components/PageShell";

const Dashboard = () => {
  const stats = useMemo(() => {
    const data = getData();
    const today = getTodayString();
    const todayRecords = data.attendance.filter((a) => a.date === today);
    const presentToday = todayRecords.filter((a) => a.status === "present").length;
    const absentToday = todayRecords.filter((a) => a.status === "absent").length;
    const totalMarked = todayRecords.length;
    const percentage = totalMarked > 0 ? Math.round((presentToday / totalMarked) * 100) : 0;

    return {
      total: data.students.length,
      present: presentToday,
      absent: absentToday,
      percentage,
      today,
    };
  }, []);

  const cards = [
    { label: "Total Students", value: stats.total, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Present Today", value: stats.present, icon: UserCheck, color: "bg-success/10 text-success" },
    { label: "Absent Today", value: stats.absent, icon: UserX, color: "bg-destructive/10 text-destructive" },
    { label: "Attendance %", value: `${stats.percentage}%`, icon: TrendingUp, color: "bg-accent/10 text-accent" },
  ];

  return (
    <PageShell title="📊 Dashboard">
      <p className="text-xs text-muted-foreground mb-4">
        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="stat-card flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-card-foreground">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default Dashboard;
