// Re-export types from store for backward compatibility
export type { Student, AttendanceRecord } from "./store";

export interface AppData {
  students: import("./store").Student[];
  attendance: import("./store").AttendanceRecord[];
  batches: string[];
  faculties: string[];
  nextId: number;
}
