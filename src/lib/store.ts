import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: number;
  name: string;
  mobile: string;
  batch: string;
  faculty: string;
}

export interface AttendanceRecord {
  studentId: number;
  date: string;
  status: "present" | "absent";
}

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    mobile: s.mobile,
    batch: s.batch,
    faculty: s.faculty,
  }));
}

export async function getBatches(): Promise<string[]> {
  const { data, error } = await supabase
    .from("students")
    .select("batch")
    .order("batch");
  if (error) throw error;
  return [...new Set((data || []).map((d) => d.batch))];
}

export async function getFaculties(): Promise<string[]> {
  const { data, error } = await supabase
    .from("students")
    .select("faculty")
    .order("faculty");
  if (error) throw error;
  return [...new Set((data || []).map((d) => d.faculty))];
}

export async function addStudent(student: Omit<Student, "id">): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name: student.name.toUpperCase(),
      mobile: student.mobile,
      batch: student.batch,
      faculty: student.faculty,
    })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, mobile: data.mobile, batch: data.batch, faculty: data.faculty };
}

export async function updateStudent(id: number, updates: Partial<Omit<Student, "id">>): Promise<void> {
  const payload: Record<string, string> = {};
  if (updates.name) payload.name = updates.name.toUpperCase();
  if (updates.mobile) payload.mobile = updates.mobile;
  if (updates.batch) payload.batch = updates.batch;
  if (updates.faculty) payload.faculty = updates.faculty;

  const { error } = await supabase.from("students").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteStudent(id: number): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function markAttendance(records: AttendanceRecord[]): Promise<void> {
  const { error } = await supabase
    .from("attendance_records")
    .upsert(
      records.map((r) => ({
        student_id: r.studentId,
        date: r.date,
        status: r.status,
      })),
      { onConflict: "student_id,date" }
    );
  if (error) throw error;
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("date", date);
  if (error) throw error;
  return (data || []).map((a) => ({
    studentId: a.student_id,
    date: a.date,
    status: a.status as "present" | "absent",
  }));
}

export async function getStudentAttendance(studentId: number): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((a) => ({
    studentId: a.student_id,
    date: a.date,
    status: a.status as "present" | "absent",
  }));
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*");
  if (error) throw error;
  return (data || []).map((a) => ({
    studentId: a.student_id,
    date: a.date,
    status: a.status as "present" | "absent",
  }));
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
