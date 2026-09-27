import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import { ACADEMIC_LEVEL_MAP, AcademicLevel, StudentPasswordRecord } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import {
  User,
  ShieldCheck,
  GraduationCap,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const { navigate } = useRouter();
  const { candidateUser } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [passwordRecord, setPasswordRecord] = useState<StudentPasswordRecord | null>(null);

  const matricNo = candidateUser?.regNumber || candidateUser?.id || '';

  useEffect(() => {
    if (matricNo) {
      const rec = apiClient.getStudentRecord(matricNo);
      setPasswordRecord(rec);
    }
  }, [matricNo]);

  // Validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasLetter && hasNumber && passwordsMatch && currentPassword.length > 0;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!currentPassword) {
      setFormError('Please enter your current password.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setFormError('New password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('The new password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setFormError('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.studentChangePassword({
        matricNo,
        currentPassword,
        newPassword,
      });

      setFormSuccess('Password changed successfully! Your new password is now active for all future sign-ins.');
      success('Password Updated', 'Your candidate account password has been updated securely.');

      // Clear input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh record
      const updatedRec = apiClient.getStudentRecord(matricNo);
      setPasswordRecord(updatedRec);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update password. Please check your current password and try again.');
      error('Update Failed', err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div
          id="student_profile_header"
          className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-xs relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                {candidateUser?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {candidateUser?.name || 'Candidate Profile'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Candidate
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-mono">
                  <span>
                    Matric No: <strong className="text-emerald-800 font-bold">{matricNo}</strong>
                  </span>
                  <span>•</span>
                  <span>{candidateUser?.email}</span>
                  {candidateUser?.level && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-stone-700 font-sans font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-800" />
                        {ACADEMIC_LEVEL_MAP[candidateUser.level as AcademicLevel] || candidateUser.level}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="profile_goto_dashboard_btn"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition"
              >
                <BookOpen className="w-4 h-4 text-emerald-800" />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                id="profile_goto_results_btn"
                onClick={() => navigate('/results')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition"
              >
                <Award className="w-4 h-4 text-emerald-800" />
                <span>My Results</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid: Security & Password Change */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Security Information */}
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-800" />
                Security Credentials Status
              </h2>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Account Status
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Active &amp; Examination Eligible
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Last Password Modification
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-800 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>
                      {passwordRecord?.updatedAt
                        ? `${new Date(passwordRecord.updatedAt).toLocaleDateString()} (${passwordRecord.updatedBy === 'admin' ? 'By Administrator' : 'By Student'})`
                        : 'Initial Registration Password'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Institutional Exam Rules
                  </div>
                  <p className="text-[11px] leading-normal text-amber-800/90">
                    Do not share your password with any other student. If you forget your password during an examination session, contact the Chief Invigilator or Examination Controller to perform an administrator password reset.
                  </p>
                  <button
                    type="button"
                    id="profile_btn_request_reset"
                    onClick={() => navigate('/forgot-password')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 hover:text-amber-950 underline mt-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Submit Reset Application to Admin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Change Password Form */}
          <div className="lg:col-span-2">
            <div
              id="student_change_password_card"
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs"
            >
              <div className="mb-6 pb-4 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-800" />
                  Change Account Password
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  Update your candidate examination password. You will use this new password for all subsequent test sessions.
                </p>
              </div>

              {/* Success Banner */}
              {formSuccess && (
                <div
                  id="profile_password_success"
                  className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{formSuccess}</span>
                </div>
              )}

              {/* Error Banner */}
              {formError && (
                <div
                  id="profile_password_error"
                  className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 animate-shake"
                >
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{formError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
                {/* Current Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="profile_current_password"
                      className="block text-xs font-bold text-stone-700"
                    >
                      Current Password *
                    </label>
                    <button
                      type="button"
                      id="profile_link_forgot_password"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="profile_current_password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your existing password"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="profile_new_password"
                    className="block text-xs font-bold text-stone-700 mb-1.5"
                  >
                    New Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="profile_new_password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters with letters &amp; numbers"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Criteria checklist */}
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    <div
                      className={`text-[11px] font-medium flex items-center gap-1.5 p-2 rounded-lg border ${
                        hasMinLength
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasMinLength ? 'text-emerald-700' : 'text-stone-400'}`} />
                      <span>8+ chars</span>
                    </div>

                    <div
                      className={`text-[11px] font-medium flex items-center gap-1.5 p-2 rounded-lg border ${
                        hasLetter
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasLetter ? 'text-emerald-700' : 'text-stone-400'}`} />
                      <span>Has letter</span>
                    </div>

                    <div
                      className={`text-[11px] font-medium flex items-center gap-1.5 p-2 rounded-lg border ${
                        hasNumber
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasNumber ? 'text-emerald-700' : 'text-stone-400'}`} />
                      <span>Has number</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="profile_confirm_password"
                    className="block text-xs font-bold text-stone-700 mb-1.5"
                  >
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="profile_confirm_password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your new password"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn_submit_change_password"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
