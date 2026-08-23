import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ApiError } from '../services/apiClient';
import {
  LogIn,
  Hash,
  Lock,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  Loader2,
  Clock,
} from 'lucide-react';

export const CandidateLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { loginCandidate } = useAuth();
  const { success } = useToast();

  const [matricNo, setMatricNo] = useState('CBT/2026/CS/0492');
  const [password, setPassword] = useState('Candidate@123!');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFormError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (lockoutSeconds > 0) {
      setFormError(`Account temporarily locked due to repeated failed attempts. Try again in ${lockoutSeconds}s.`);
      return;
    }

    if (!matricNo.trim() || !password) {
      setFormError('Please enter both your matric number and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginCandidate(matricNo.trim(), password);
      success('Candidate Authenticated', 'Redirecting to your candidate dashboard...');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError('Invalid credentials');
        } else if (err.status === 423) {
          setFormError('Account temporarily locked due to repeated failed attempts. Try again later.');
          setLockoutSeconds(30);
        } else if (err.status === 429) {
          setFormError('Too many attempts — please wait a moment before trying again.');
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Invalid credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (demoMatric: string) => {
    setMatricNo(demoMatric);
    setPassword('Candidate@123!');
    setFormError(null);
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div
          id="candidate_login_card"
          className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto mb-3 shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Candidate Login</h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Official sign in to access examinations and verified results
            </p>
          </div>

          {/* Form Error Notice (401, 423, 429) */}
          {formError && (
            <div
              id="login_form_error"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
              <div>
                <span className="font-medium">{formError}</span>
                {isLocked && (
                  <div className="mt-1 flex items-center gap-1.5 text-rose-700 font-mono text-[11px] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cooldown active: {lockoutSeconds}s remaining</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Matric Number */}
            <div>
              <label htmlFor="candidate_matric_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                Matriculation / Candidate ID *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="candidate_matric_input"
                  name="matric_no"
                  disabled={isLocked || isSubmitting}
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  placeholder="e.g. CBT/2026/CS/0492"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="candidate_password_input" className="text-xs font-bold text-stone-700">
                  Password *
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="candidate_password_input"
                  name="password"
                  disabled={isLocked || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="candidate_login_submit_btn"
              disabled={isSubmitting || isLocked}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isLocked ? (
                <span>Locked ({lockoutSeconds}s)</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn_demo_candidate_1"
                disabled={isLocked}
                onClick={() => setDemoAccount('CBT/2026/CS/0492')}
                className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition disabled:opacity-50"
              >
                <span className="text-xs font-bold text-stone-900 block truncate">Kosi Nwafor</span>
                <span className="text-[10px] text-emerald-800 block font-mono font-semibold">CBT/2026/CS/0492</span>
              </button>
              <button
                type="button"
                id="btn_demo_candidate_2"
                disabled={isLocked}
                onClick={() => setDemoAccount('CBT/2026/CS/0511')}
                className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition disabled:opacity-50"
              >
                <span className="text-xs font-bold text-stone-900 block truncate">Sarah Jenkins</span>
                <span className="text-[10px] text-emerald-800 block font-mono font-semibold">CBT/2026/CS/0511</span>
              </button>
            </div>
          </div>

          {/* Link: "New here? Create an account" */}
          <div className="mt-5 space-y-2 text-center">
            <p className="text-xs text-stone-600">
              New here?{' '}
              <button
                type="button"
                id="link_to_candidate_register"
                onClick={() => navigate('/register')}
                className="font-bold text-emerald-800 hover:underline"
              >
                Create an account
              </button>
            </p>

            <p className="text-xs text-stone-500 pt-2 border-t border-stone-200">
              Need administrator access?{' '}
              <button
                type="button"
                id="link_to_admin_login"
                onClick={() => navigate('/admin/login')}
                className="font-bold text-stone-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" />
                Admin Security Portal
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

