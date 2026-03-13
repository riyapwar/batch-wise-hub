import { supabase } from "@/integrations/supabase/client";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzOhg6HQ3WjuwH_gsM05CSvkD-CA691cabYWLe-t65yhiBB1lyzxnbQvBrKKhBuJ05h/exec";

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

/**
 * Google Apps Script URL parameter conventions:
 *
 * GET ?action=getStudents
 *   → returns JSON: { students: [{ id, name, mobile, batch, faculty }, ...] }
 *
 * GET ?action=addStudent&student_id=...&name=...&mobile=...&batch=...&faculty=...
 *   → adds a row, returns JSON: { success: true }
 *
 * GET ?action=updateStudent&student_id=...&name=...&mobile=...&batch=...&faculty=...
 *   → updates the row matching student_id, returns JSON: { success: true }
 *
 * GET ?action=deleteStudent&student_id=...
 *   → deletes the row matching student_id, returns JSON: { success: true }
 */

async function gsheetFetch(params: Record<string, string>) {
  const url = `${GOOGLE_SCRIPT_URL}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Sheet request failed");
  return res.json();
}

export async function getStudents(): Promise<Student[]> {
  try {
    const data = await gsheetFetch({ action: "getStudents" });
    return (data.students || []).map((s: any) => ({
      id: Number(s.id || s.student_id),
      name: String(s.name || ""),
      mobile: String(s.mobile || ""),
      batch: String(s.batch || ""),
      faculty: String(s.faculty || ""),
    }));
  } catch (e) {
    console.error("Failed to fetch students from Google Sheet:", e);
    return [];
  }
}

export async function getBatches(): Promise<string[]> {
  const students = await getStudents();
  return [...new Set(students.map((s) => s.batch).filter(Boolean))].sort();
}

export async function getFaculties(): Promise<string[]> {
  const students = await getStudents();
  return [...new Set(students.map((s) => s.faculty).filter(Boolean))].sort();
}

export async function addStudent(student: Omit<Student, "id">): Promise<Student> {
  const studentId = Date.now().toString();
  await gsheetFetch({
    action: "addStudent",
    student_id: studentId,
    name: student.name.toUpperCase(),
    mobile: student.mobile,
    batch: student.batch,
    faculty: student.faculty,
  });
  return {
    id: Number(studentId),
    name: student.name.toUpperCase(),
    mobile: student.mobile,
    batch: student.batch,
    faculty: student.faculty,
  };
}

export async function updateStudent(id: number, updates: Partial<Omit<Student, "id">>): Promise<void> {
  await gsheetFetch({
    action: "updateStudent",
    student_id: String(id),
    name: updates.name?.toUpperCase() || "",
    mobile: updates.mobile || "",
    batch: updates.batch || "",
    faculty: updates.faculty || "",
  });
}

export async function deleteStudent(id: number): Promise<void> {
  await gsheetFetch({
    action: "deleteStudent",
    student_id: String(id),
  });
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
