export interface Student {
  id: string;
  name: string;
  phone: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

export interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent";
  date: string; // YYYY-MM-DD
}
