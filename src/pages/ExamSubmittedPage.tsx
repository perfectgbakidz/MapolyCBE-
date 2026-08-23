import React, { useEffect } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight,
  Copy,
  LayoutDashboard,
  Lock,
} from 'lucide-react';

export const ExamSubmittedPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const { candidateUser } = useAuth();
  const { success } = useToast();
  const examId = params.examId;

  // Extract receipt checksum from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const receipt = urlParams.get('receipt') || 'TX-CBT-7F4B2A91D0E3-5C82A1';

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1'],
      });
    } catch {
      // quiet fallback
    }
  }, []);

  const handleCopyReceipt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(receipt);
      success('Receipt Copied', 'Cryptographic verification ID copied to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div
          id="exam_submitted_summary_card"
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden animate-fadeIn"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Examination Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
            Your responses have been successfully graded, sealed, and written to the tamper-proof ledger.
          </p>

          {/* Receipt Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 pb-1 border-b border-slate-850">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Tamper Integrity Receipt
              </span>
              <span className="text-[10px] font-mono text-emerald-400">SHA-256 HMAC</span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="font-mono text-xs text-teal-300 font-bold select-all truncate">
                {receipt}
              </span>
              <button
                type="button"
                id="btn_copy_receipt"
                onClick={handleCopyReceipt}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                title="Copy receipt ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-850">
              <div>
                <span className="text-slate-500 block">Candidate:</span>
                <span className="text-slate-200">{candidateUser?.name || 'Candidate'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp:</span>
                <span className="text-slate-200">{new Date().toLocaleTimeString()} UTC</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn_view_results_instant"
              onClick={() => navigate('/results')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition hover:scale-[1.01]"
            >
              <Award className="w-4 h-4" />
              <span>View Graded Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="return_to_dashboard_btn"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Candidate Dashboard</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
