import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  BookOpen,
  Award,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Wifi,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { candidateUser, candidateToken, logoutCandidate, adminToken } = useAuth();

  const handleLogout = () => {
    logoutCandidate();
    navigate('/login');
  };

  return (
    <nav
      id="candidate_main_navbar"
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-left focus:outline-none group"
              id="nav_brand_btn"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shadow-sm text-white group-hover:bg-emerald-900 transition-colors">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-stone-900 flex items-center gap-2">
                  MapolyCBE <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">CBE</span>
                </span>
                <p className="text-[11px] text-stone-500 font-medium">Moshood Abiola Polytechnic • CBE Center</p>
              </div>
            </button>

            {/* Candidate Nav Links */}
            {candidateToken && (
              <div className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-stone-200">
                <button
                  type="button"
                  id="nav_link_dashboard"
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    currentPath === '/dashboard' || currentPath.startsWith('/exam')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Available Exams
                </button>
                <button
                  type="button"
                  id="nav_link_results"
                  onClick={() => navigate('/results')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    currentPath === '/results'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  My Results
                </button>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Live Sync Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-250 text-xs text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-mono text-[11px] font-medium">Sync: Online</span>
            </div>

            {/* Admin Switcher shortcut */}
            <button
              type="button"
              id="nav_switch_to_admin"
              onClick={() => navigate(adminToken ? '/admin/dashboard' : '/admin/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition"
              title="Switch to Administrator Security Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" />
              <span>Admin Portal</span>
            </button>

            {candidateToken && candidateUser ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900">{candidateUser.name}</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-semibold">{candidateUser.regNumber || 'CANDIDATE'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {candidateUser.name.charAt(0)}
                </div>
                <button
                  type="button"
                  id="candidate_logout_btn"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                  title="Log out candidate"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="nav_login_btn"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Candidate Login
                </button>
                <button
                  type="button"
                  id="nav_register_btn"
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white transition shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
