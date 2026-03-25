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

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalStudents: snapshot.size }));
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
      unsubAttendance();
      unsubPayments();
    };
  }, []);

  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      light: "bg-blue-50",
      text: "text-blue-600",
      trend: "Enrolled",
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: CalendarCheck,
      light: "bg-green-50",
      text: "text-green-600",
      trend: "Present today",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      light: "bg-purple-50",
      text: "text-purple-600",
      trend: "All time",
    },
  ];

  return (
    <div className="space-y-6 animate-fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Activity</h2>
            <button className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight">View All</button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all flex-shrink-0">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">New student enrolled</p>
                  <p className="text-xs text-slate-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[200px] sm:min-h-[240px]">
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">Professional Support</h2>
            <p className="text-indigo-100/80 text-sm max-w-[200px] leading-relaxed">Upgrade your plan to get advanced analytics and 24/7 priority support.</p>
          </div>
          <button className="relative z-10 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm w-fit mt-4 sm:mt-6 hover:bg-slate-50 transition-colors">
            Get Pro Now
          </button>
          <TrendingUp className="absolute -right-8 -bottom-8 w-48 sm:w-64 h-48 sm:h-64 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  );
}
