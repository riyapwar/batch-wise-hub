import { useState, useMemo } from "react";
import { getData, markAttendance, getTodayString, getAttendanceForDate } from "@/lib/store";
import { AttendanceRecord } from "@/lib/types";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const Attendance = () => {
  const [date, setDate] = useState(getTodayString());
  const [refresh, setRefresh] = useState(0);

  const data = useMemo(() => getData(), [refresh]);
  const existing = useMemo(() => getAttendanceForDate(date), [date, refresh]);

  const [localStatus, setLocalStatus] = useState<Record<number, "present" | "absent">>({});

  const getStatus = (studentId: number): "present" | "absent" | null => {
    if (localStatus[studentId]) return localStatus[studentId];
    const rec = existing.find((a) => a.studentId === studentId);
    return rec?.status ?? null;
  };

  const toggle = (studentId: number) => {
    const current = getStatus(studentId);
    const next = current === "present" ? "absent" : "present";
    setLocalStatus((prev) => ({ ...prev, [studentId]: next }));
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = data.students.map((s) => ({
      studentId: s.id,
      date,
      status: localStatus[s.id] ?? existing.find((a) => a.studentId === s.id)?.status ?? "absent",
    }));
    markAttendance(records);
    setLocalStatus({});
    setRefresh((r) => r + 1);
    toast.success(`Attendance saved for ${date}`);
  };

  const [batchFilter, setBatchFilter] = useState("");
  const students = useMemo(() => {
    if (!batchFilter) return data.students;
    return data.students.filter((s) => s.batch === batchFilter);
  }, [data.students, batchFilter]);

  return (
    <PageShell title="✅ Mark Attendance">
      <div className="flex gap-2 mb-4">
        <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setLocalStatus({}); }} className="flex-1" />
        <select
          className="rounded-lg border border-input bg-card px-2 text-xs text-card-foreground"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {data.batches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {students.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">No students. Add students first.</p>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {students.map((s) => {
              const status = getStatus(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`stat-card w-full flex items-center justify-between transition-colors ${
                    status === "present"
                      ? "border-success/40 bg-success/5"
                      : status === "absent"
                      ? "border-destructive/40 bg-destructive/5"
                      : ""
                  }`}
                >
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm text-card-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {s.id} · {s.batch}</p>
                  </div>
                  {status === "present" ? (
                    <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                  ) : status === "absent" ? (
                    <XCircle className="h-6 w-6 text-destructive shrink-0" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          <Button className="w-full" onClick={handleSave}>
            Save Attendance
          </Button>
        </>
      )}
    </PageShell>
  );
};

export default Attendance;
