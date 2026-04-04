"use client";

import { useState, useEffect } from "react";
import { 
  collection, addDoc, onSnapshot, deleteDoc, 
  doc, updateDoc, serverTimestamp, query, 
  orderBy, where, getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/types";
import { UserPlus, Search, Trash2, Phone, User, X, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { Payment } from "@/types";
import { format } from "date-fns";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");

  const currentMonth = format(new Date(), "yyyy-MM");

  // Modal state — "add" yoki "edit"
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const qStudents = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
      setLoading(false);
    });

    return () => { unsubStudents(); unsubPayments(); };
  }, []);

  const getStudentStatus = (studentId: string) => {
    const hasPaid = payments.some(p => {
      if (!p.date) return false;
      const paymentDate = p.date.seconds 
        ? format(new Date(p.date.seconds * 1000), "yyyy-MM")
        : format(new Date(), "yyyy-MM");
      return p.studentId === studentId && paymentDate === currentMonth;
    });
    return hasPaid ? "paid" : "unpaid";
  };

  const getStudentHistory = (studentId: string) => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
  };

  const openAddModal = () => {
    setModalMode("add");
    setName("");
    setPhone("+998 ");
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setModalMode("edit");
    setName(student.name);
    setPhone(student.phone);
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (name.trim().length < 3) {
      toast.error("Ism kamida 3 ta harfdan iborat bo'lishi kerak!");
      return;
    }

    try {
      if (modalMode === "add") {
        // Dublikat tekshiruvi
        const q = query(
          collection(db, "students"),
          where("name", "==", name),
          where("phone", "==", phone)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          toast.error("Bunday ism va telefon raqamli talaba allaqachon mavjud!");
          return;
        }

        await addDoc(collection(db, "students"), {
          name, phone, createdAt: serverTimestamp()
        });
        toast.success("✅ Talaba qo'shildi!");

      } else if (modalMode === "edit" && editingStudent) {
        await updateDoc(doc(db, "students", editingStudent.id), { name, phone });
        toast.success("✏️ Talaba ma'lumotlari yangilandi!");
      }

      closeModal();
    } catch {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Talabani o'chirishni tasdiqlaysizmi? Unga tegishli to'lov va davomatlar ham o'chib ketadi!")) {
      try {
        // 1. To'lovlarni o'chirish
        const paymentsQuery = query(collection(db, "payments"), where("studentId", "==", id));
        const paymentDocs = await getDocs(paymentsQuery);
        const paymentDeletions = paymentDocs.docs.map(d => deleteDoc(doc(db, "payments", d.id)));

        // 2. Davomatlarni o'chirish
        const attendanceQuery = query(collection(db, "attendance"), where("studentId", "==", id));
        const attendanceDocs = await getDocs(attendanceQuery);
        const attendanceDeletions = attendanceDocs.docs.map(d => deleteDoc(doc(db, "attendance", d.id)));

        // Hamma aloqador narsalarni o'chirishni kutish
        await Promise.all([...paymentDeletions, ...attendanceDeletions]);

        // 3. Oxirida talabani o'zini o'chirish
        await deleteDoc(doc(db, "students", id));
        toast.success("🗑️ Talaba va barcha ma'lumotlari o'chirildi!");
      } catch {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm);
    const status = getStudentStatus(s.id);
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && status === filterStatus;
  });

  const stats = {
    total: students.length,
    paid: students.filter(s => getStudentStatus(s.id) === "paid").length,
    unpaid: students.filter(s => getStudentStatus(s.id) === "unpaid").length,
  };

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Talaba qo&apos;shish
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Jami talabalar</p>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-3xl border border-green-100 shadow-sm">
          <p className="text-green-600/60 text-xs font-black uppercase tracking-widest mb-1">To&apos;laganlar</p>
          <p className="text-2xl font-black text-green-700">{stats.paid}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-red-600/60 text-xs font-black uppercase tracking-widest mb-1">To&apos;lamaganlar</p>
          <p className="text-2xl font-black text-red-700">{stats.unpaid}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Ism yoki telefon orqali qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
            {(["all", "paid", "unpaid"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === s 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {s === "all" ? "Hammasi" : s === "paid" ? "To'lagan" : "To'lamagan"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Talaba ismi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">To&apos;lov holati</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefon raqami</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Talabalar topilmadi.</td></tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-bold text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Qo'shilgan: {student.createdAt?.seconds ? format(new Date(student.createdAt.seconds * 1000), "dd.MM.yyyy") : ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStudentStatus(student.id) === "paid" ? (
                        <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-green-100">To&apos;lagan</span>
                      ) : (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-red-100">To&apos;lamagan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Phone className="w-4 h-4 text-slate-300" />
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-md shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {modalMode === "add" ? "Yangi talaba" : "Talabani tahrirlash"}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">To&apos;liq ismi</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                      placeholder="Masalan: Ali Valiyev"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Telefon raqami</label>
                  <div className="relative">
                    <input
                      required
                      type="tel"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                      placeholder="+998 00 000 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {modalMode === "add" ? (
                    <><UserPlus className="w-5 h-5" /> Saqlash</>
                  ) : (
                    <><Pencil className="w-5 h-5" /> Yangilash</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
