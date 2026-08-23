import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ApiError } from '../services/apiClient';
import {
  UserPlus,
  Mail,
  User,
  Hash,
  Lock,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const CandidateRegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { registerCandidate } = useAuth();
  const { success, error } = useToast();

  const [matricNo, setMatricNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};

    const trimmedMatric = matricNo.trim();
    if (!trimmedMatric) {
      errors.matric_no = 'Matric/registration number is required.';
    } else if (trimmedMatric.length < 3 || trimmedMatric.length > 50) {
      errors.matric_no = 'Matric number must be between 3 and 50 characters.';
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.full_name = 'Full name is required.';
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.full_name = 'Full name must be between 2 and 100 characters.';
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8 || password.length > 128) {
      errors.password = 'Password must be between 8 and 128 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validateClientSide()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCandidate({
        matric_no: matricNo.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
      });
      success('Account Created', 'Candidate registration completed successfully.');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          // Conflict error
          if (err.fieldErrors) {
            setFieldErrors(err.fieldErrors);
          } else {
            setFormError('matric_no or email already registered');
          }
        } else if (err.status === 422 && err.fieldErrors) {
          // Validation error mapping
          setFieldErrors(err.fieldErrors);
        } else {
          setFormError(err.message);
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setFormError(msg);
        error('Registration Failed', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setMatricNo(`MAPOLY/2026/CS/${randomDigits}`);
    setFullName('Chioma Adeleke');
    setEmail(`chioma.${randomDigits}@mapoly.edu.ng`);
    setPassword('Candidate@2026!');
    setFieldErrors({});
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div
          id="candidate_register_card"
          className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto mb-3 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Candidate Registration</h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Create your official examination candidate profile
            </p>
          </div>

          {/* Form Top Error Notice */}
          {formError && (
            <div
              id="register_form_error"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
              <span className="font-medium">{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Field 1: Matric/registration number */}
            <div>
              <label htmlFor="reg_input_matric" className="block text-xs font-bold text-stone-700 mb-1">
                Matric / Registration Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="reg_input_matric"
                  name="matric_no"
                  value={matricNo}
                  onChange={(e) => {
                    setMatricNo(e.target.value);
                    if (fieldErrors.matric_no) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.matric_no;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. CBT/2026/CS/4891"
                  className={`w-full bg-stone-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition ${
                    fieldErrors.matric_no
                      ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                      : 'border-stone-300 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
              {fieldErrors.matric_no && (
                <p id="error_matric_no" className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.matric_no}</span>
                </p>
              )}
            </div>

            {/* Field 2: Full name */}
            <div>
              <label htmlFor="reg_input_name" className="block text-xs font-bold text-stone-700 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="reg_input_name"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.full_name) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.full_name;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. Chioma Adeleke"
                  className={`w-full bg-stone-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition ${
                    fieldErrors.full_name
                      ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                      : 'border-stone-300 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
              {fieldErrors.full_name && (
                <p id="error_full_name" className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.full_name}</span>
                </p>
              )}
            </div>

            {/* Field 3: Email */}
            <div>
              <label htmlFor="reg_input_email" className="block text-xs font-bold text-stone-700 mb-1">
                Institutional Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="reg_input_email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  placeholder="candidate@mapoly.edu.ng"
                  className={`w-full bg-stone-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition ${
                    fieldErrors.email
                      ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                      : 'border-stone-300 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p id="error_email" className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Field 4: Password */}
            <div>
              <label htmlFor="reg_input_password" className="block text-xs font-bold text-stone-700 mb-1">
                Password (min 8 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="reg_input_password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full bg-stone-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition ${
                    fieldErrors.password
                      ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                      : 'border-stone-300 focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p id="error_password" className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="candidate_register_submit_btn"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>

          {/* 1-Click Demo autofill */}
          <div className="mt-4 pt-4 border-t border-stone-200 text-center">
            <button
              type="button"
              id="btn_autofill_candidate_demo"
              onClick={autofillDemo}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-900 font-bold py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Autofill
            </button>
          </div>

          {/* Link: "Already have an account? Log in" */}
          <div className="mt-4 text-center">
            <p className="text-xs text-stone-600">
              Already have an account?{' '}
              <button
                type="button"
                id="link_to_candidate_login"
                onClick={() => navigate('/login')}
                className="font-bold text-emerald-800 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

