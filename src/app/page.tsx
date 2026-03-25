"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Payment, Attendance } from "@/types";
import { Users, CreditCard, CalendarCheck, TrendingUp, UserPlus, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    // Total Students
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalStudents: snapshot.size }));
    });

    // Today's Attendance
    const today = format(new Date(), "yyyy-MM-dd");
    const qAttendance = query(collection(db, "attendance"), where("date", "==", today), where("status", "==", "present"));
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      setStats((prev) => ({ ...prev, todayAttendance: snapshot.size }));
    });

    // Total Payments
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
      color: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-600",
      trend: "+12% from last month",
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: CalendarCheck,
      color: "bg-green-500",
      light: "bg-green-50",
      text: "text-green-600",
      trend: "Normal attendance rate",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
      light: "bg-purple-50",
      text: "text-purple-600",
      trend: "+5% from last month",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening at your center today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.light} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${card.text}`} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.trend}</span>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium">{card.title}</h3>
                <p className="text-3xl font-black text-slate-900 mt-1">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">New student enrolled</p>
                  <p className="text-xs text-slate-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 tracking-tight">Professional Support</h2>
            <p className="text-indigo-100/80 text-sm max-w-[200px] leading-relaxed">Upgrade your plan to get advanced analytics and 24/7 priority support.</p>
          </div>
          <button className="relative z-10 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm w-fit mt-6 hover:bg-slate-50 transition-colors">
            Get Pro Now
          </button>
          <TrendingUp className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  );
}
