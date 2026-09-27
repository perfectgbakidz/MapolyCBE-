import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { PasswordResetRequest } from '../types';
import {
  KeyRound,
  Hash,
  Mail,
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useRouter();
  const { success, error } = useToast();

  const [matricNo, setMatricNo] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<PasswordResetRequest | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!matricNo.trim()) {
      setFormError('Please provide your Matriculation Number or Candidate ID.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please provide a valid registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const req = await apiClient.createPasswordResetRequest({
        matricNo: matricNo.trim(),
        email: email.trim(),
        reason: reason.trim() || 'Forgot examination portal login credentials',
      });

      setSubmittedRequest(req);
      success(
        'Reset Request Logged',
        'Your password reset request has been transmitted to the Examination Controller.'
      );
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit password reset request. Please try again.');
      error('Submission Error', err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div
          id="forgot_password_card"
          className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-md p-6 sm:p-8 animate-fadeIn"
        >
          {submittedRequest ? (
            /* Success / Request Tracking State */
            <div className="space-y-6 text-center" id="reset_request_success_view">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Request Submitted to Admin</h1>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  Your password reset application is registered with the examination office
                </p>
              </div>

              {/* Ticket Details */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <span className="text-stone-500 font-sans font-bold">Tracking ID:</span>
                  <span className="font-bold text-emerald-800">{submittedRequest.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <span className="text-stone-500 font-sans font-bold">Matric Number:</span>
                  <span className="font-bold text-stone-900">{submittedRequest.matricNo}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <span className="text-stone-500 font-sans font-bold">Registered Email:</span>
                  <span className="text-stone-700">{submittedRequest.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-sans font-bold">Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold uppercase text-[10px]">
                    <Clock className="w-3 h-3" /> Pending Admin Action
                  </span>
                </div>
              </div>

              {/* Policy note */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-left leading-relaxed flex gap-2.5 items-start">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Institutional Security Protocol:</strong>
                  Per Moshood Abiola Polytechnic exam regulations, only an authorized examination officer or system
                  administrator can reset student credentials. The admin can assign your new password directly from the
                  Student Management Console.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  id="btn_return_login"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition"
                >
                  Return to Candidate Sign In
                </button>
                <button
                  type="button"
                  id="btn_submit_another"
                  onClick={() => {
                    setSubmittedRequest(null);
                    setMatricNo('');
                    setEmail('');
                    setReason('');
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            /* Reset Request Submission Form */
            <div>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto mb-3 shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Forgot Password?</h1>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  Submit an official credential reset request to the Examination Administrator
                </p>
              </div>

              {/* Exam Security Notice */}
              <div className="mb-5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs flex items-start gap-2.5 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block mb-0.5">Admin-Governed Password Resets</span>
                  To safeguard against identity theft and exam fraud, student passwords cannot be reset via unverified
                  links. Once submitted, your request is reviewed and updated by an authorized exam officer.
                </div>
              </div>

              {/* Form Error Notice */}
              {formError && (
                <div
                  id="forgot_form_error"
                  className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Matric Number */}
                <div>
                  <label htmlFor="forgot_matric_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                    Matriculation Number / Candidate ID *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="forgot_matric_input"
                      value={matricNo}
                      onChange={(e) => setMatricNo(e.target.value)}
                      placeholder="e.g. CBT/2026/CS/0492"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="forgot_email_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                    Registered Institutional Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="forgot_email_input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. candidate@mapoly.edu.ng"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition"
                    />
                  </div>
                </div>

                {/* Reason / Details */}
                <div>
                  <label htmlFor="forgot_reason_input" className="block text-xs font-bold text-stone-700 mb-1.5">
                    Reason / Details (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <textarea
                      id="forgot_reason_input"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Locked out of computer terminal before scheduled ND1 exam"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="forgot_submit_btn"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition hover:shadow disabled:opacity-50 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Request...' : 'Send Request to Examination Admin'}</span>
                </button>
              </form>

              {/* Navigation links */}
              <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  id="back_to_login_btn"
                  onClick={() => navigate('/login')}
                  className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>

                <button
                  type="button"
                  id="link_to_admin_from_forgot"
                  onClick={() => navigate('/admin/login')}
                  className="text-stone-500 hover:text-stone-800 font-medium inline-flex items-center gap-1"
                >
                  <span>Admin Security Portal</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
