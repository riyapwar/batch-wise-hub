export interface Student {
  id: number;
  name: string;
  mobile: string;
  batch: string;
  faculty: string;
}

export interface AttendanceRecord {
  studentId: number;
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
}

export interface AppData {
  students: Student[];
  attendance: AttendanceRecord[];
  batches: string[];
  faculties: string[];
  nextId: number;
}
