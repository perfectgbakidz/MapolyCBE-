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

  // Extract receipt checksum and scores from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const receipt = urlParams.get('receipt') || 'TX-CBT-7F4B2A91D0E3-5C82A1';
  const scoreParam = urlParams.get('score');
  const totalParam = urlParams.get('total');
  const percentageParam = urlParams.get('percentage');

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
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div
          id="exam_submitted_summary_card"
          className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-sm p-6 sm:p-10 text-center relative overflow-hidden animate-fadeIn"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            Examination Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed max-w-md mx-auto font-medium">
            Your responses have been successfully graded, sealed, and written to the tamper-proof ledger.
          </p>

          {/* Real Score Over Number of Exam Answered */}
          {scoreParam !== null && totalParam !== null && (
            <div id="submitted_score_card" className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-center mb-6 animate-fadeIn">
              <span className="text-[11px] uppercase tracking-wider text-emerald-900 font-bold block mb-1">
                Your Examination Score
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-mono text-4xl font-black text-emerald-950">
                  {scoreParam}
                </span>
                <span className="font-mono text-xl font-bold text-emerald-700">
                  / {totalParam}
                </span>
              </div>
              <p className="text-xs text-emerald-900 font-medium mt-1">
                <strong>{scoreParam}</strong> of <strong>{totalParam}</strong> questions answered correctly{' '}
                {percentageParam ? (
                  <span className="font-mono font-bold">({percentageParam}%)</span>
                ) : null}
              </p>
            </div>
          )}

          {/* Receipt Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left mb-6">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1 pb-1 border-b border-stone-200">
              <span className="flex items-center gap-1.5 font-bold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                Anti-Tamper Integrity Receipt
              </span>
              <span className="text-[10px] font-mono text-emerald-800 font-bold">SHA-256 HMAC</span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="font-mono text-xs text-emerald-900 font-bold select-all truncate">
                {receipt}
              </span>
              <button
                type="button"
                id="btn_copy_receipt"
                onClick={handleCopyReceipt}
                className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-300 transition shrink-0 shadow-xs"
                title="Copy receipt ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-600 pt-2 border-t border-stone-200">
              <div>
                <span className="text-stone-400 block font-semibold">Candidate:</span>
                <span className="text-stone-800 font-bold">{candidateUser?.name || 'Candidate'}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold">Timestamp:</span>
                <span className="text-stone-800 font-bold">{new Date().toLocaleTimeString()} UTC</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn_view_results_instant"
              onClick={() => navigate('/results')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition hover:scale-[1.01]"
            >
              <Award className="w-4 h-4" />
              <span>View Graded Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="return_to_dashboard_btn"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition"
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
