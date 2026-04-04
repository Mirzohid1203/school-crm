"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/types";
import { Users, CalendarCheck, DollarSign, TrendingUp, Phone } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    totalPayments: 0,
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  useEffect(() => {
    const qStudents = query(collection(db, "students"), orderBy("createdAt", "desc"), limit(5));
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalStudents: snapshot.size }));
    });
    const unsubRecent = onSnapshot(qStudents, (snapshot) => {
      setRecentStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Student[]);
    });

    const today = format(new Date(), "yyyy-MM-dd");
    const qAttendance = query(
      collection(db, "attendance"),
      where("date", "==", today),
      where("status", "==", "present")
    );
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      setStats((prev) => ({ ...prev, todayAttendance: snapshot.size }));
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setStats((prev) => ({ ...prev, totalPayments: total }));
    });

    return () => {
      unsubStudents();
      unsubRecent();
      unsubAttendance();
      unsubPayments();
    };
  }, []);

  const cards = [
    {
      title: "Jami talabalar",
      value: stats.totalStudents,
      icon: Users,
      light: "bg-blue-50",
      text: "text-blue-600",
      trend: "Ro'yxatdan o'tgan",
    },
    {
      title: "Bugungi davomat",
      value: stats.todayAttendance,
      icon: CalendarCheck,
      light: "bg-green-50",
      text: "text-green-600",
      trend: "Bugun kelganlar",
    },
    {
      title: "Umumiy tushum",
      value: `${stats.totalPayments.toLocaleString()} so'm`,
      icon: DollarSign,
      light: "bg-purple-50",
      text: "text-purple-600",
      trend: "Barcha vaqtlar",
    },
  ];

  return (
    <div className="space-y-6 animate-fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Boshqaruv paneli</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Xush kelibsiz! Bugungi holat bilan tanishing.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4 sm:block">
              <div className={`${card.light} p-3 rounded-2xl mb-0 sm:mb-4 flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${card.text}`} />
              </div>
              <div>
                <h3 className="text-slate-500 text-xs sm:text-sm font-medium">{card.title}</h3>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{card.value}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1 hidden sm:block">{card.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Yaqinda qo&apos;shilganlar</h2>
            <Link href="/students" className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight">
              Hammasini ko&apos;rish
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentStudents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">Hozircha talabalar yo&apos;q.</p>
            ) : (
              recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
