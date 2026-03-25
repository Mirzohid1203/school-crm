"use client";

import { useState, useEffect } from "react";
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Student } from "@/types";
import { CreditCard, Plus, User, DollarSign, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });

    const q = query(collection(db, "payments"), orderBy("date", "desc"));
    const unsubPayments = onSnapshot(q, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
      setLoading(false);
    });

    return () => { unsubStudents(); unsubPayments(); };
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    try {
      await addDoc(collection(db, "payments"), {
        studentId,
        studentName: student.name,
        amount: Number(amount),
        date: serverTimestamp()
      });
      toast.success("To'lov qayd etildi!");
      setStudentId(""); setAmount(""); setIsModalOpen(false);
    } catch {
      toast.error("To'lovni saqlashda xatolik");
    }
  };

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Payments History</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Track your center's revenue and transactions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Record Payment
        </button>
      </div>

      {/* Revenue Card */}
      <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-200 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-1">Total Revenue</p>
          <p className="text-3xl sm:text-4xl font-black">${totalRevenue.toLocaleString()}</p>
        </div>
        <CreditCard className="w-24 sm:w-32 h-24 sm:h-32 text-white/10 absolute -right-4 top-1/2 -translate-y-1/2 rotate-12" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">No payments yet.</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm sm:text-base truncate">{payment.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-black text-indigo-600 text-sm sm:text-base">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-400 text-xs sm:text-sm font-medium hidden sm:table-cell">
                      {payment.date?.seconds ? format(new Date(payment.date.seconds * 1000), "PPP p") : "Just now"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Record Payment</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddPayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Student</label>
                  <div className="relative">
                    <select required className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none bg-white text-slate-900" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                      <option value="">Choose a student...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Amount ($)</label>
                  <div className="relative">
                    <input required type="number" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <DollarSign className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Save Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
