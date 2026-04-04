"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Lock, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Xush kelibsiz!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Hisob muvaffaqiyatli yaratildi!");
      }
      router.push("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Identifikatsiyadan o'tishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-indigo-600 p-4 rounded-2xl mb-4 shadow-xl shadow-indigo-200">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduFlow CRM</h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? "Markazingizni boshqarish uchun tizimga kiring" : "Yangi admin hisobini yaratish"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email manzili</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? "Kirish" : "Hisob yaratish"}
                </>
              )}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors text-sm"
            >
              {isLogin ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Tizimga kiring"}
            </button>
          </div>
        </form>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          Professional O&apos;quv CRM v1.0
        </p>
      </div>
    </div>
  );
}
