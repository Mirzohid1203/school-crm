"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Attendance } from "@/types";
import { Calendar, Search, CheckCircle2, XCircle, Users, Clock, Filter, User } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch students
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });

    // Fetch attendance for selected date
    const q = query(collection(db, "attendance"), where("date", "==", selectedDate));
    const unsubAttendance = onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Attendance[]);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubAttendance();
    };
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
      toast.success(`${student.name} marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId)?.status;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Attendance</h1>
          <p className="text-slate-500 mt-1">Track student presence and filter by historical dates.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <span className="absolute -top-2.5 left-4 bg-white px-2 py-0.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 border border-slate-100 rounded-lg">Filter Date</span>
            <input
              type="date"
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700 bg-white shadow-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Calendar className="w-5 h-5 text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700 bg-white placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-100 rounded-2xl">
               <Users className="w-6 h-6 text-indigo-600" />
             </div>
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enrolled Students</p>
               <p className="text-2xl font-black text-slate-900">{filteredStudents.length}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               Present: {attendance.filter(a => a.status === "present").length}
            </div>
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               Absent: {attendance.filter(a => a.status === "absent").length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-slate-100">
          {loading ? (
             <div className="col-span-full py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</div>
          ) : filteredStudents.length === 0 ? (
             <div className="col-span-full py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No students found</div>
          ) : (
            filteredStudents.map((student) => {
              const status = getStatus(student.id);
              return (
                <div key={student.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm transition-transform group-hover:scale-105">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{student.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleAttendance(student, "present")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all border ${
                        status === "present"
                          ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100 scale-[1.02]"
                          : "bg-white text-slate-400 border-slate-100 hover:border-green-200 hover:text-green-600"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Present
                    </button>
                    <button
                      onClick={() => toggleAttendance(student, "absent")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all border ${
                        status === "absent"
                          ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-100 scale-[1.02]"
                          : "bg-white text-slate-400 border-slate-100 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-800">
         <Clock className="w-5 h-5 flex-shrink-0" />
         <p className="text-sm font-bold tracking-tight">System tracks attendance for the selected date. You can change the date above to view or edit historical records.</p>
      </div>
    </div>
  );
}
