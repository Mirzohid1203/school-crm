"use client";

import { useState, useEffect } from "react";
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Student } from "@/types";
import { CreditCard, Plus, User, Banknote, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Users } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [showUnpaid, setShowUnpaid] = useState(false);

  const currentMonth = format(new Date(), "yyyy-MM");
  
  const studentPayments = studentId 
    ? payments.filter(p => p.studentId === studentId) 
    : [];

  const unpaidStudents = students.filter(student => {
    const hasPaidThisMonth = payments.some(p => {
      if (!p.date) return false;
      const paymentDate = p.date.seconds 
        ? format(new Date(p.date.seconds * 1000), "yyyy-MM")
        : format(new Date(), "yyyy-MM");
      return p.studentId === student.id && paymentDate === currentMonth;
    });
    return !hasPaidThisMonth;
  });

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">To&apos;lovlar tarixi</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Markazingiz daromadlari va barcha tranzaksiyalarni kuzating.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowUnpaid(!showUnpaid)}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-3 rounded-2xl font-bold transition-all border flex items-center justify-center gap-2 text-sm sm:text-base ${
              showUnpaid 
                ? "bg-amber-100 text-amber-700 border-amber-200" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">{showUnpaid ? "Tarix" : "To'lamaganlar"}</span>
            <span className="xs:hidden">{showUnpaid ? "Tarix" : "Qarzdorlar"}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-[1.5] sm:flex-none bg-indigo-600 text-white px-4 sm:px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
            <span>To&apos;lov</span>
          </button>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-200 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-1">Umumiy daromad</p>
          <p className="text-3xl sm:text-4xl font-black">{totalRevenue.toLocaleString()} so&apos;m</p>
        </div>
        <CreditCard className="w-24 sm:w-32 h-24 sm:h-32 text-white/10 absolute -right-4 top-1/2 -translate-y-1/2 rotate-12" />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {showUnpaid ? `To'lamagan talabalar (${format(new Date(), "MMMM")})` : "To'lovlar tarixi"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          {showUnpaid ? (
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Talaba ismi</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefon</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {unpaidStudents.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">Hamma to'lov qilgan! 👏</td></tr>
                ) : (
                  unpaidStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors flex-shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-sm sm:text-base">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm">{student.phone}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-100">To&apos;lamagan</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Talaba ismi</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Summa</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">To&apos;lovlar yuklanmoqda...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">Hozircha to&apos;lovlar yo&apos;q.</td></tr>
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
                        {payment.amount.toLocaleString()} so&apos;m
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-400 text-xs sm:text-sm font-medium hidden sm:table-cell">
                        {payment.date?.seconds ? format(new Date(payment.date.seconds * 1000), "PPP p") : "Hozirgina"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full sm:max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">To&apos;lovni qayd etish</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddPayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Talabani tanlang</label>
                  <div className="relative">
                    <select required className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none bg-white text-slate-900" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                      <option value="">Talabani tanlang...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  </div>
                  
                  {studentId && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarix</p>
                        <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{studentPayments.length} ta to'lov</p>
                      </div>
                      {studentPayments.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium">Hali to&apos;lovlar yo&apos;q</p>
                      ) : (
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                          {studentPayments.map((p) => (
                            <div key={p.id} className="flex justify-between items-center text-[10px] font-bold text-slate-600 px-2 py-1.5 bg-white border border-slate-100 rounded-lg">
                              <span>{p.date?.seconds ? format(new Date(p.date.seconds * 1000), "dd.MM.yyyy") : "Bugun"}</span>
                              <span className="text-indigo-600">{p.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Summa (so&apos;m)</label>
                  <div className="relative">
                    <input required type="number" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <Banknote className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  To&apos;lovni saqlash
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
