import React from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import {
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Zap,
  ArrowRight,
  Fingerprint,
  Cpu,
  Clock,
  Sparkles,
  Server,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { candidateToken, adminToken } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Subtle background ambient tint */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            <span>MapolyCBE • Moshood Abiola Polytechnic CBE System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15] mb-6">
            Institutional Testing with{' '}
            <span className="text-emerald-800 underline decoration-emerald-300 decoration-wavy decoration-2">
              Cryptographic Integrity
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
            Moshood Abiola Polytechnic authoritative assessment delivery system featuring sub-second answer synchronization, SHA-256 tamper-evident verification, and live security audits.
          </p>

          {/* Quick Start Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              id="hero_start_candidate_btn"
              onClick={() => navigate(candidateToken ? '/dashboard' : '/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition hover:-translate-y-0.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{candidateToken ? 'Go to Candidate Dashboard' : 'Candidate Portal (Take Exam)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="hero_start_admin_btn"
              onClick={() => navigate(adminToken ? '/admin/dashboard' : '/admin/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold text-sm transition shadow-xs hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-800" />
              <span>{adminToken ? 'Open Admin Console' : 'Administrator & Security Console'}</span>
            </button>
          </div>
        </div>

        {/* Role Select Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Candidate Card */}
          <div
            id="role_card_candidate"
            onClick={() => navigate(candidateToken ? '/dashboard' : '/login')}
            className="group relative bg-white hover:bg-stone-50/80 border border-stone-200 hover:border-emerald-700/60 rounded-2xl p-8 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Candidate Portal
                </span>
              </div>

              <h2 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors">
                Candidate Assessment Portal
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Authenticate with your matriculation credentials, review official instructions, complete timed assessments with instant autosave, and receive tamper-proof score receipts.
              </p>

              <ul className="space-y-2.5 text-xs text-stone-700 mb-6">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Instant write persistence after every answer selection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Authoritative countdown timer with zero drift</span>
                </li>
                <li className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>SHA-256 tamper-proof submission seal</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 group-hover:translate-x-1 transition-transform pt-4 border-t border-stone-100">
              <span>Enter Candidate Space</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Admin Card */}
          <div
            id="role_card_admin"
            onClick={() => navigate(adminToken ? '/admin/dashboard' : '/admin/login')}
            className="group relative bg-white hover:bg-stone-50/80 border border-stone-200 hover:border-emerald-700/60 rounded-2xl p-8 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6 text-emerald-800" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-300">
                  Controller Portal
                </span>
              </div>

              <h2 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors">
                Administrator &amp; Security Console
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Author and schedule question banks, monitor real-time candidate session telemetry, audit tamper-evidence checksums, and inspect security alerts.
              </p>

              <ul className="space-y-2.5 text-xs text-stone-700 mb-6">
                <li className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Live telemetry feed of authentication &amp; rate limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Automated Merkle tree &amp; SHA-256 HMAC integrity auditor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Exam lifecycle orchestration &amp; question bank authoring</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 group-hover:translate-x-1 transition-transform pt-4 border-t border-stone-100">
              <span>Enter Security Controller</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
