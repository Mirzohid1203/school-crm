import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center bg-indigo-100 p-5 rounded-3xl mb-6">
          <GraduationCap className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-7xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
