"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full transition-all duration-300">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">EduFlow</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
