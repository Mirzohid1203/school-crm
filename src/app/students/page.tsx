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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state — "add" yoki "edit"
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setName("");
    setPhone("");
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
    if (confirm("Talabani o'chirishni tasdiqlaysizmi?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        toast.success("🗑️ Talaba o'chirildi");
      } catch {
        toast.error("O'chirishda xatolik");
      }
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage all your enrolled students in one place.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/50">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Loading...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">No students found.</td></tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-bold text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                      </div>
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
                          title="Edit student"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete student"
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
                  {modalMode === "add" ? "New Student" : "Edit Student"}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
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
                    <><UserPlus className="w-5 h-5" /> Save Student</>
                  ) : (
                    <><Pencil className="w-5 h-5" /> Update Student</>
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
