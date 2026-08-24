import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {

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
            Moshood Abiola Polytechnic{' '}
            <span className="text-emerald-800 underline decoration-emerald-300 decoration-wavy decoration-2">
              Secure CBE Portal
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Moshood Abiola Polytechnic CBE delivery system featuring sub-second answer synchronization, SHA-256 tamper-evident verification, and live security audits.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};
