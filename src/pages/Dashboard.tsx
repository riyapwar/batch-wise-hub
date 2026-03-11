import { useQuery } from "@tanstack/react-query";
import { getStudents, getAttendanceForDate, getTodayString } from "@/lib/store";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import PageShell from "@/components/PageShell";

const Dashboard = () => {
  const today = getTodayString();

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: todayRecords = [] } = useQuery({
    queryKey: ["attendance", today],
    queryFn: () => getAttendanceForDate(today),
  });

  const presentToday = todayRecords.filter((a) => a.status === "present").length;
  const absentToday = todayRecords.filter((a) => a.status === "absent").length;
  const totalMarked = todayRecords.length;
  const percentage = totalMarked > 0 ? Math.round((presentToday / totalMarked) * 100) : 0;

  const cards = [
    { label: "Total Students", value: students.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Present Today", value: presentToday, icon: UserCheck, color: "bg-success/10 text-success" },
    { label: "Absent Today", value: absentToday, icon: UserX, color: "bg-destructive/10 text-destructive" },
    { label: "Attendance %", value: `${percentage}%`, icon: TrendingUp, color: "bg-accent/10 text-accent" },
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
