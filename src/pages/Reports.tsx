import { useState, useMemo } from "react";
import { getData } from "@/lib/store";
import PageShell from "@/components/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Reports = () => {
  const data = useMemo(() => getData(), []);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | "">("");

  const batchReport = useMemo(() => {
    if (!selectedBatch) return null;
    const students = data.students.filter((s) => s.batch === selectedBatch);
    return students.map((s) => {
      const records = data.attendance.filter((a) => a.studentId === s.id);
      const present = records.filter((a) => a.status === "present").length;
      const total = records.length;
      return { ...s, present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
    });
  }, [selectedBatch, data]);

  const facultyReport = useMemo(() => {
    if (!selectedFaculty) return null;
    const students = data.students.filter((s) => s.faculty === selectedFaculty);
    return students.map((s) => {
      const records = data.attendance.filter((a) => a.studentId === s.id);
      const present = records.filter((a) => a.status === "present").length;
      const total = records.length;
      return { ...s, present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
    });
  }, [selectedFaculty, data]);

  const studentReport = useMemo(() => {
    if (!selectedStudent) return null;
    const student = data.students.find((s) => s.id === selectedStudent);
    if (!student) return null;
    const records = data.attendance
      .filter((a) => a.studentId === selectedStudent)
      .sort((a, b) => b.date.localeCompare(a.date));
    return { student, records };
  }, [selectedStudent, data]);

  return (
    <PageShell title="📈 Reports">
      <Tabs defaultValue="batch">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="batch" className="flex-1 text-xs">Batch</TabsTrigger>
          <TabsTrigger value="faculty" className="flex-1 text-xs">Faculty</TabsTrigger>
          <TabsTrigger value="student" className="flex-1 text-xs">Student</TabsTrigger>
        </TabsList>

        <TabsContent value="batch">
          <select
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground mb-4"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Select Batch</option>
            {data.batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {batchReport && <ReportTable rows={batchReport} />}
        </TabsContent>

        <TabsContent value="faculty">
          <select
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground mb-4"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">Select Faculty</option>
            {data.faculties.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {facultyReport && <ReportTable rows={facultyReport} />}
        </TabsContent>

        <TabsContent value="student">
          <select
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground mb-4"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select Student</option>
            {data.students.map((s) => <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>)}
          </select>
          {studentReport && (
            <div className="space-y-2">
              <div className="stat-card">
                <p className="font-semibold text-sm text-card-foreground">{studentReport.student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {studentReport.student.batch} · {studentReport.student.faculty}
                </p>
              </div>
              {studentReport.records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No attendance records</p>
              ) : (
                studentReport.records.map((r) => (
                  <div key={r.date} className="stat-card flex items-center justify-between">
                    <span className="text-sm text-card-foreground">{r.date}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "present"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
};

const ReportTable = ({ rows }: { rows: { id: number; name: string; present: number; total: number; pct: number }[] }) => (
  <div className="space-y-2">
    {rows.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-8">No students in this group</p>
    ) : (
      rows.map((r) => (
        <div key={r.id} className="stat-card flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-card-foreground truncate">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.present}/{r.total} days present</p>
          </div>
          <span className={`text-sm font-bold ${
            r.pct >= 75 ? "text-success" : r.pct >= 50 ? "text-accent" : "text-destructive"
          }`}>
            {r.pct}%
          </span>
        </div>
      ))
    )}
  </div>
);

export default Reports;
