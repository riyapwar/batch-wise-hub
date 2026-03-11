import { useState, useMemo, useCallback } from "react";
import { getData, addStudent, updateStudent, deleteStudent } from "@/lib/store";
import { Student } from "@/lib/types";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const Students = () => {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [batch, setBatch] = useState("");
  const [faculty, setFaculty] = useState("");

  const data = useMemo(() => getData(), [refresh]);

  const filtered = useMemo(() => {
    if (!search) return data.students;
    const q = search.toLowerCase();
    return data.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q) ||
        s.faculty.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [data.students, search]);

  const resetForm = () => {
    setName("");
    setMobile("");
    setBatch("");
    setFaculty("");
    setEditingStudent(null);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setMobile(s.mobile);
    setBatch(s.batch);
    setFaculty(s.faculty);
    setDialogOpen(true);
  };

  const handleSave = useCallback(() => {
    if (!name.trim() || !mobile.trim() || !batch.trim() || !faculty.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, { name, mobile, batch, faculty });
      toast.success("Student updated");
    } else {
      addStudent({ name, mobile, batch, faculty });
      toast.success("Student added");
    }

    resetForm();
    setDialogOpen(false);
    setRefresh((r) => r + 1);
  }, [name, mobile, batch, faculty, editingStudent]);

  const handleDelete = (id: number) => {
    deleteStudent(id);
    toast.success("Student deleted");
    setRefresh((r) => r + 1);
  };

  return (
    <PageShell
      title="👨‍🎓 Students"
      action={
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-1 text-xs">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              <div>
                <Input placeholder="Batch Name" value={batch} onChange={(e) => setBatch(e.target.value)} list="batches" />
                <datalist id="batches">
                  {data.batches.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <Input placeholder="Faculty Name" value={faculty} onChange={(e) => setFaculty(e.target.value)} list="faculties" />
                <datalist id="faculties">
                  {data.faculties.map((f) => <option key={f} value={f} />)}
                </datalist>
              </div>
              <Button className="w-full" onClick={handleSave}>
                {editingStudent ? "Update" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">No students found. Add your first student!</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="stat-card flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {s.id} · {s.batch} · {s.faculty}
                </p>
                <p className="text-xs text-muted-foreground">{s.mobile}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(s)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Students;
