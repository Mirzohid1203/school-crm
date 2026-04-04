"use client";

import { useState, useEffect } from "react";
import { 
  collection, onSnapshot, doc, setDoc, query, where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Attendance } from "@/types";
import { Calendar, Search, CheckCircle2, XCircle, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });

    const q = query(collection(db, "attendance"), where("date", "==", selectedDate));
    const unsubAttendance = onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Attendance[]);
      setLoading(false);
    });

    return () => { unsubStudents(); unsubAttendance(); };
  }, [selectedDate]);

  const toggleAttendance = async (student: Student, status: "present" | "absent") => {
    const attendanceId = `${student.id}_${selectedDate}`;
    try {
      await setDoc(doc(db, "attendance", attendanceId), {
        studentId: student.id,
        studentName: student.name,
        status,
        date: selectedDate
      });
      toast.success(`${student.name} — ${status === "present" ? "✅ Keldi" : "❌ Kelmadi"}`);
    } catch {
      toast.error("Davomatni saqlashda xatolik");
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (studentId: string) =>
    attendance.find(a => a.studentId === studentId)?.status;

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Kunlik davomat</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Talabalar davomatini sana bo&apos;yicha kuzating va saralang.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="date"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 bg-white shadow-sm text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Calendar className="w-5 h-5 text-indigo-600 absolute left-4 top-3.5" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Talabalarni qidirish..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white placeholder:text-slate-400 shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-indigo-100 rounded-xl sm:rounded-2xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Jami talabalar</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{filteredStudents.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100 text-xs font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Kelganlar: {presentCount}
            </div>
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100 text-xs font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Kelmaganlar: {absentCount}
            </div>
          </div>
        </div>

        {/* Student Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
            Ma&apos;lumotlar yuklanmoqda...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
            Talabalar topilmadi
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 sm:gap-0 divide-slate-100">
            {filteredStudents.map((student, index) => {
              const status = getStatus(student.id);
              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 hover:bg-slate-50/70 transition-colors group ${
                    index % 2 === 0 ? "sm:border-r border-slate-100" : ""
                  } ${index < filteredStudents.length - 2 ? "sm:border-b border-slate-100" : ""}`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 leading-tight truncate text-sm sm:text-base">{student.name}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{student.phone}</p>
                    </div>
                    {status && (
                      <span className={`ml-auto flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        status === "present"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {status === "present" ? "✅ Keldi" : "❌ Kelmadi"}
                      </span>
                    )}
                  </div>

                  {/* Attendance Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleAttendance(student, "present")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                        status === "present"
                          ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100 scale-[1.02]"
                          : "bg-white text-slate-400 border-slate-200 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Keldi
                    </button>
                    <button
                      onClick={() => toggleAttendance(student, "absent")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                        status === "absent"
                          ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-100 scale-[1.02]"
                          : "bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      Kelmadi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-semibold leading-relaxed">
          Davomat kunlik hisoblanadi. O&apos;tgan kunlar davomatini ko&apos;rish yoki tahrirlash uchun yuqoridagi sanani o&apos;zgartiring.
        </p>
      </div>
    </div>
  );
}
