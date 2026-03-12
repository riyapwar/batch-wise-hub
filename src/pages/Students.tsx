import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudents, getBatches, getFaculties, updateStudent, deleteStudent } from "@/lib/store";
import { Student } from "@/lib/store";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwANs6BiJEr0S2pUlHNBS-M8UcnVe1Gz8BCpSy_ro6LE3-I_SVNCf4NuEQudcWksUO/exec";

const Students = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [batch, setBatch] = useState("");
  const [faculty, setFaculty] = useState("");

  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: getStudents });
  const { data: batches = [] } = useQuery({ queryKey: ["batches"], queryFn: getBatches });
  const { data: faculties = [] } = useQuery({ queryKey: ["faculties"], queryFn: getFaculties });

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q) ||
        s.faculty.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [students, search]);

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["batches"] });
    queryClient.invalidateQueries({ queryKey: ["faculties"] });
  };

  const handleSave = useCallback(async () => {
    if (!name.trim() || !mobile.trim() || !batch.trim() || !faculty.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, { name, mobile, batch, faculty });
        toast.success("Student updated");
      } else {
        const params = new URLSearchParams({
          student_id: Date.now().toString(),
          name: name.toUpperCase(),
          mobile: mobile,
          batch: batch,
          faculty: faculty,
        });
        await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
          method: "GET",
          mode: "no-cors",
        });
        toast.success("Student added to Google Sheet");
      }

      resetForm();
      setDialogOpen(false);
      invalidate();
    } catch (e) {
      toast.error("Something went wrong");
    }
  }, [name, mobile, batch, faculty, editingStudent]);

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
      invalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
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
                  {batches.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <Input placeholder="Faculty Name" value={faculty} onChange={(e) => setFaculty(e.target.value)} list="faculties" />
                <datalist id="faculties">
                  {faculties.map((f) => <option key={f} value={f} />)}
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
