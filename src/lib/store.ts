import { AppData, Student, AttendanceRecord } from "./types";

const STORAGE_KEY = "attendance-app-data";

const defaultData: AppData = {
  students: [],
  attendance: [],
  batches: [],
  faculties: [],
  nextId: 1,
};

export function getData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  return JSON.parse(raw);
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addStudent(student: Omit<Student, "id">): Student {
  const data = getData();
  const newStudent: Student = {
    ...student,
    name: student.name.toUpperCase(),
    id: data.nextId,
  };
  data.students.push(newStudent);
  data.nextId++;

  if (!data.batches.includes(student.batch)) {
    data.batches.push(student.batch);
  }
  if (!data.faculties.includes(student.faculty)) {
    data.faculties.push(student.faculty);
  }

  saveData(data);
  return newStudent;
}

export function updateStudent(id: number, updates: Partial<Omit<Student, "id">>): void {
  const data = getData();
  const idx = data.students.findIndex((s) => s.id === id);
  if (idx === -1) return;

  if (updates.name) updates.name = updates.name.toUpperCase();
  data.students[idx] = { ...data.students[idx], ...updates };

  if (updates.batch && !data.batches.includes(updates.batch)) {
    data.batches.push(updates.batch);
  }
  if (updates.faculty && !data.faculties.includes(updates.faculty)) {
    data.faculties.push(updates.faculty);
  }

  saveData(data);
}

export function deleteStudent(id: number): void {
  const data = getData();
  data.students = data.students.filter((s) => s.id !== id);
  data.attendance = data.attendance.filter((a) => a.studentId !== id);
  saveData(data);
}

export function markAttendance(records: AttendanceRecord[]): void {
  const data = getData();
  for (const rec of records) {
    const idx = data.attendance.findIndex(
      (a) => a.studentId === rec.studentId && a.date === rec.date
    );
    if (idx >= 0) {
      data.attendance[idx] = rec;
    } else {
      data.attendance.push(rec);
    }
  }
  saveData(data);
}

export function getAttendanceForDate(date: string): AttendanceRecord[] {
  return getData().attendance.filter((a) => a.date === date);
}

export function getStudentAttendance(studentId: number): AttendanceRecord[] {
  return getData().attendance.filter((a) => a.studentId === studentId);
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
