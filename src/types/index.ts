export interface Student {
  id: string;
  name: string;
  phone: string;
  createdAt: any;
}

export interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  date: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent";
  date: string; // YYYY-MM-DD
}
