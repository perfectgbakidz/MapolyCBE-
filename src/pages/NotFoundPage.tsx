import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { FileQuestion, ArrowLeft, Home, Compass, KeyRound, LogIn, User } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div
          id="not_found_card"
          className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl animate-fadeIn"
        >
          {/* Centered Illustration */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/50">
              <FileQuestion className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            HTTP 404 • ROUTE NOT FOUND
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-4 mb-2">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
            The examination pathway or resource endpoint you requested does not exist or has been relocated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn_back_to_home"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              id="btn_404_go_back"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Helpful Pathways */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Examination Pathways
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                id="btn_404_to_login"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition font-medium"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                id="btn_404_to_forgot"
                onClick={() => navigate('/forgot-password')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition font-medium"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Forgot Password</span>
              </button>
              <button
                type="button"
                id="btn_404_to_profile"
                onClick={() => navigate('/profile')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition font-medium"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Student Profile</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
