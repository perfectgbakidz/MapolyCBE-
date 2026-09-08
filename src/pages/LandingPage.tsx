import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Award,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Subtle background ambient tint */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Official Computer-Based Examination System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.15] mb-5">
            Moshood Abiola Polytechnic{' '}
            <span className="text-emerald-800 underline decoration-emerald-300 decoration-wavy decoration-2">
              Secure CBE Portal
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Moshood Abiola Polytechnic CBE delivery system featuring real-time response caching, 3-strike anti-cheat monitoring, verified SHA-256 result checksums, and dedicated Parent & Guardian portals.
          </p>
        </div>

        {/* Portals Grid: Candidate, Parent, Admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Candidate Portal */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1.5">Candidate Portal</h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Enrolled students can sit scheduled computer-based examinations, track progress, review enrolled courses, and access verified result slips.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                id="hero_candidate_login_btn"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Candidate Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="hero_candidate_register_btn"
                onClick={() => navigate('/register')}
                className="w-full py-2 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 transition"
              >
                Register Candidate
              </button>
            </div>
          </div>

          {/* Parent & Guardian Portal */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1.5">Parent & Guardian Portal</h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Parents and legal guardians can link multiple wards to monitor scheduled exams, view live completion statuses, and inspect tamper-evident verified score reports.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                id="hero_parent_portal_btn"
                onClick={() => navigate('/parent/login')}
                className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Parent Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="hero_parent_register_btn"
                onClick={() => navigate('/parent/register')}
                className="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 transition"
              >
                Register as Guardian
              </button>
            </div>
          </div>

          {/* Administrator Portal */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-bold mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1.5">Examination Officer</h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Authorized departmental admins configure courses, author question banks, schedule test sessions, and supervise real-time candidate anti-cheat alerts.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                id="hero_admin_login_btn"
                onClick={() => navigate('/admin/login')}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Admin Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="py-2 px-4 text-center text-[11px] text-stone-400 font-medium">
                Restricted to authorized MAPOLY staff
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
