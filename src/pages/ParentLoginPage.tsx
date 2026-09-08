import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ApiError } from '../services/apiClient';
import {
  LogIn,
  Phone,
  Lock,
  AlertCircle,
  Users,
  ShieldCheck,
  Loader2,
  Clock,
  UserPlus,
} from 'lucide-react';

export const ParentLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { loginParent } = useAuth();
  const { success } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
      setFormError(`Account temporarily locked due to failed attempts. Try again in ${lockoutSeconds}s.`);
      return;
    }

    if (!identifier.trim() || !password) {
      setFormError('Please enter both your phone number and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginParent(identifier.trim(), password);
      success('Parent Authenticated', 'Access granted to your wards academic dashboard.');
      navigate('/parent/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError('Invalid phone number or password. Please verify your credentials.');
        } else if (err.status === 423) {
          setFormError('Account temporarily locked. Please try again in 30 seconds.');
          setLockoutSeconds(30);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Unable to authenticate parent credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div
          id="parent_login_card"
          className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mx-auto mb-3 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Parent & Guardian Portal
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Sign in with your registered phone number to view your wards' exam results and academic records.
            </p>
          </div>

          {/* Form Error or Lockout Notification */}
          {formError && (
            <div
              id="parent_login_error_banner"
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs animate-shake ${
                isLocked
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {isLocked ? (
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {formError}
                {isLocked && (
                  <p className="mt-1 font-bold text-amber-800">
                    Remaining lockout: {lockoutSeconds} seconds
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Phone Number / Identifier */}
            <div>
              <label htmlFor="parent_identifier_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                Registered Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  id="parent_identifier_input"
                  name="identifier"
                  disabled={isLocked || isSubmitting}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 08023456789"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="parent_password_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="parent_password_input"
                  name="password"
                  disabled={isLocked || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="parent_login_submit_btn"
              disabled={isSubmitting || isLocked}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-sm transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Parent Records...</span>
                </>
              ) : isLocked ? (
                <span>Locked ({lockoutSeconds}s)</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Access Parent Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-Fill Button if needed */}
          <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
            <p className="text-[11px] text-stone-500 mb-1.5">Quick Demo Parent Account:</p>
            <button
              type="button"
              id="parent_quick_fill_btn"
              onClick={() => {
                setIdentifier('08023456789');
                setPassword('ParentPassword123!');
              }}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline"
            >
              Use Registered Demo Parent (Chief Adeleke Balogun)
            </button>
          </div>

          {/* Registration link */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-center">
            <button
              type="button"
              id="parent_goto_register_btn"
              onClick={() => navigate('/parent/register')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold transition inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Need to register as a parent? Create Account
            </button>
          </div>

          {/* Switch to Candidate or Admin */}
          <div className="mt-4 text-center flex items-center justify-center gap-4 text-xs text-stone-500">
            <button
              type="button"
              id="parent_switch_to_candidate_btn"
              onClick={() => navigate('/login')}
              className="hover:text-emerald-800 transition inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              Candidate Login
            </button>
            <span>&bull;</span>
            <button
              type="button"
              id="parent_switch_to_admin_btn"
              onClick={() => navigate('/admin/login')}
              className="hover:text-stone-800 transition"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
