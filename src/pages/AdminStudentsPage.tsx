import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import {
  CandidateAdminView,
  CandidateAdminDetail,
  CandidateUpdate,
  StudentResultWithExam,
  AcademicLevel,
  ACADEMIC_LEVELS,
  ACADEMIC_LEVEL_MAP,
  SingleIntegrityVerification,
  PasswordResetRequest,
} from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Award,
  BookOpen,
  Edit,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Mail,
  GraduationCap,
  ChevronRight,
  X,
  ExternalLink,
  Save,
  Clock,
  Fingerprint,
  KeyRound,
  Copy,
  Sparkles,
  Check,
  Inbox,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { success, error, info, warning } = useToast();

  // State
  const [students, setStudents] = useState<CandidateAdminView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [selectedStudentForResults, setSelectedStudentForResults] = useState<CandidateAdminView | null>(null);
  const [studentResults, setStudentResults] = useState<StudentResultWithExam[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
  const [verifiedResultsMap, setVerifiedResultsMap] = useState<Record<string, SingleIntegrityVerification>>({});
  const [verifyingResultId, setVerifyingResultId] = useState<string | null>(null);

  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<CandidateAdminDetail | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  const [editingStudent, setEditingStudent] = useState<CandidateAdminView | null>(null);
  const [editFormData, setEditFormData] = useState<{ full_name: string; email: string; level: AcademicLevel }>({
    full_name: '',
    email: '',
    level: 'ND1',
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Action busy states
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // Password Management State
  const [passwordModalStudent, setPasswordModalStudent] = useState<CandidateAdminView | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<{ matricNo: string; newPass: string } | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState<boolean>(true);

  // Reset Requests State
  const [showResetRequestsModal, setShowResetRequestsModal] = useState<boolean>(false);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [pendingResetCount, setPendingResetCount] = useState<number>(0);

  const loadResetRequests = useCallback(async () => {
    try {
      const list = await apiClient.getPasswordResetRequests();
      setResetRequests(list);
      setPendingResetCount(list.filter((r) => r.status === 'pending').length);
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    loadResetRequests();
  }, [loadResetRequests]);

  // Fetch student directory
  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.listStudents({
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        search: searchQuery.trim() || undefined,
      });
      setStudents(data);
    } catch (err: any) {
      error('Directory Error', err.message || 'Failed to load students directory');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLevel, searchQuery, error]);

  useEffect(() => {
    loadStudents();
  }, [selectedLevel]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadStudents();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStudents();
  };

  // View Student Results
  const handleOpenResults = async (student: CandidateAdminView) => {
    setSelectedStudentForResults(student);
    setStudentResults([]);
    setVerifiedResultsMap({});
    setIsLoadingResults(true);
    try {
      const results = await apiClient.getStudentResults(student.id);
      setStudentResults(results);
    } catch (err: any) {
      error('Results Error', err.message || 'Failed to load student results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  // View Student Profile Detail & Enrolled Courses
  const handleOpenProfile = async (student: CandidateAdminView) => {
    setIsLoadingProfile(true);
    try {
      const detail = await apiClient.getStudentProfile(student.id);
      setSelectedStudentForProfile(detail);
    } catch (err: any) {
      error('Profile Error', err.message || 'Failed to load student detailed profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Open Edit Student Modal
  const handleOpenEdit = (student: CandidateAdminView) => {
    setEditingStudent(student);
    setEditFormData({
      full_name: student.full_name,
      email: student.email,
      level: student.level,
    });
  };

  // Save Student Updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSavingEdit(true);

    try {
      const updates: CandidateUpdate = {
        full_name: editFormData.full_name.trim(),
        email: editFormData.email.trim(),
        level: editFormData.level,
      };

      const updated = await apiClient.updateStudent(editingStudent.id, updates);
      success('Student Profile Updated', `Student ${updated.full_name} profile updated successfully.`);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingStudent(null);
    } catch (err: any) {
      error('Update Failed', err.message || 'Failed to update student profile');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Toggle Activate / Deactivate
  const handleToggleActive = async (student: CandidateAdminView) => {
    setActionBusyId(student.id);
    try {
      if (student.is_active) {
        const updated = await apiClient.deactivateStudent(student.id);
        info('Student Deactivated', `Student ${student.full_name} has been deactivated.`);
        setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
      } else {
        const updated = await apiClient.activateStudent(student.id);
        success('Student Activated', `Student ${student.full_name} has been activated.`);
        setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
      }
    } catch (err: any) {
      error('Action Failed', err.message || 'Failed to change student active state');
    } finally {
      setActionBusyId(null);
    }
  };

  // Unlock Student
  const handleUnlockStudent = async (student: CandidateAdminView) => {
    setActionBusyId(student.id);
    try {
      const updated = await apiClient.unlockStudent(student.id);
      success('Account Unlocked', `Student ${student.full_name} has been unlocked successfully.`);
      setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
    } catch (err: any) {
      error('Unlock Failed', err.message || 'Failed to unlock student');
    } finally {
      setActionBusyId(null);
    }
  };

  // Open Password Modal
  const handleOpenChangePassword = (student: CandidateAdminView) => {
    setPasswordModalStudent(student);
    setNewPasswordInput('');
    setAdminNoteInput('');
    setPasswordChangeSuccess(null);
    setCopiedToClipboard(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Mapoly@${rand}!`;
    setNewPasswordInput(generated);
  };

  const handleSaveStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStudent || !newPasswordInput.trim()) return;

    if (newPasswordInput.trim().length < 8) {
      error('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.adminChangeStudentPassword({
        candidateId: passwordModalStudent.id,
        matricNo: passwordModalStudent.matric_no,
        email: passwordModalStudent.email,
        fullName: passwordModalStudent.full_name,
        level: passwordModalStudent.level,
        newPassword: newPasswordInput.trim(),
        adminNotes: adminNoteInput.trim() || 'Admin-initiated password change via Examination Console',
      });

      success('Password Updated', `New password assigned to candidate ${passwordModalStudent.full_name}.`);
      setPasswordChangeSuccess({
        matricNo: passwordModalStudent.matric_no,
        newPass: newPasswordInput.trim(),
      });
      loadResetRequests();
    } catch (err: any) {
      error('Update Failed', err.message || 'Failed to update student password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleApproveResetRequest = (req: PasswordResetRequest) => {
    const matchingStudent = students.find((s) => s.matric_no.toLowerCase() === req.matricNo.toLowerCase());
    if (matchingStudent) {
      setPasswordModalStudent(matchingStudent);
    } else {
      setPasswordModalStudent({
        id: req.matricNo,
        matric_no: req.matricNo,
        full_name: req.fullName || 'Candidate',
        email: req.email,
        level: 'ND1',
        is_active: true,
        is_locked: false,
        failed_login_attempts: 0,
        created_at: req.requestedAt,
      });
    }
    handleGenerateRandomPassword();
    setAdminNoteInput(`Resolving request ${req.id}: ${req.reason || 'Candidate password reset'}`);
    setShowResetRequestsModal(false);
  };

  const handleRejectResetRequest = async (requestId: string) => {
    try {
      await apiClient.rejectPasswordResetRequest(requestId, 'Dismissed by administrator');
      info('Request Dismissed', 'Password reset request was dismissed.');
      loadResetRequests();
    } catch (err: any) {
      error('Error', err.message || 'Failed to dismiss request');
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    success('Copied', 'Candidate credentials copied to clipboard.');
    setTimeout(() => setCopiedToClipboard(false), 3000);
  };

  // Verify Result Cryptographic Checksum
  const handleVerifyResult = async (resultId: string) => {
    setVerifyingResultId(resultId);
    try {
      const verifyRes = await apiClient.verifyResultIntegrity(resultId);
      setVerifiedResultsMap((prev) => ({ ...prev, [resultId]: verifyRes }));
      if (verifyRes.intact) {
        success('Integrity Verified', 'Cryptographic signature verified intact.');
      } else {
        warning('Integrity Alert', 'Warning: Checksum signature mismatch detected!');
      }
    } catch (err: any) {
      error('Verification Failed', err.message || 'Verification failed');
    } finally {
      setVerifyingResultId(null);
    }
  };

  // Summary Metrics
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.is_active).length;
  const lockedCount = students.filter((s) => s.is_locked).length;

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
                <Users className="w-7 h-7 text-emerald-800" />
                Student &amp; Candidate Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                Live Roster
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Manage student registrations, academic levels, account locks, and inspect authenticated exam results
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Password Reset Requests Button */}
            <button
              type="button"
              id="admin_reset_requests_btn"
              onClick={() => {
                loadResetRequests();
                setShowResetRequestsModal(true);
              }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 transition shadow-xs"
              title="Review candidate password reset requests"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Password Requests</span>
              {pendingResetCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] animate-pulse">
                  {pendingResetCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="admin_refresh_students_btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-800 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
            <button
              type="button"
              id="admin_goto_courses_btn"
              onClick={() => navigate('/admin/courses')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Manage Courses</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8" id="student_metrics_grid">
          {/* Card 1: Total Students */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 block mb-1">Enrolled Candidates</span>
              <div className="font-mono text-3xl font-black text-stone-900">{totalCount}</div>
              <span className="text-[11px] text-stone-500 font-medium">Matching current filter</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active Accounts */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 block mb-1">Active Status</span>
              <div className="font-mono text-3xl font-black text-emerald-800">{activeCount}</div>
              <span className="text-[11px] text-stone-500 font-medium">Permitted to sit for exams</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-300 flex items-center justify-center text-teal-800">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Locked Accounts */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 block mb-1">Locked Candidates</span>
              <div className={`font-mono text-3xl font-black ${lockedCount > 0 ? 'text-rose-700' : 'text-stone-800'}`}>
                {lockedCount}
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Account lockout protection</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              lockedCount > 0 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-stone-50 border-stone-200 text-stone-400'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                id="search_students_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Matriculation Number, Full Name, or Email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Academic Level Filter */}
            <div className="flex items-center gap-3 shrink-0">
              <Filter className="w-4 h-4 text-stone-500" />
              <label htmlFor="select_level_filter" className="text-xs font-bold text-stone-700 shrink-0">
                Academic Level:
              </label>
              <select
                id="select_level_filter"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="ALL">All Academic Levels</option>
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table / Directory */}
        {isLoading ? (
          <LoadingSpinner label="Loading student records from database..." />
        ) : students.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No Students Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4 font-medium">
              {searchQuery || selectedLevel !== 'ALL'
                ? 'No students matched the current search query or academic level filter.'
                : 'No candidates have registered yet. New candidate registrations will appear here in real-time.'}
            </p>
            {(searchQuery || selectedLevel !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="students_roster_table">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Candidate / Matric No</th>
                    <th className="py-3.5 px-4">Academic Level</th>
                    <th className="py-3.5 px-4">Status &amp; Security</th>
                    <th className="py-3.5 px-4">Registration Date</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs font-medium">
                  {students.map((student) => {
                    const isBusy = actionBusyId === student.id;
                    return (
                      <tr
                        key={student.id}
                        id={`student_row_${student.id}`}
                        className="hover:bg-stone-50/80 transition-colors"
                      >
                        {/* Candidate Name & Matric No */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                              {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block text-sm leading-tight">
                                {student.full_name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                                  {student.matric_no}
                                </span>
                                <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-stone-400" />
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-bold text-xs border border-stone-300">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-800" />
                            {ACADEMIC_LEVEL_MAP[student.level] || student.level}
                          </span>
                        </td>

                        {/* Status & Security */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Active / Inactive */}
                            {student.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-300 text-[11px] font-bold">
                                <XCircle className="w-3 h-3 text-stone-500" /> Deactivated
                              </span>
                            )}

                            {/* Locked Badge */}
                            {student.is_locked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold animate-pulse">
                                <Lock className="w-3 h-3 text-rose-700" /> Locked ({student.failed_login_attempts} fails)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{new Date(student.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Results Button */}
                            <button
                              type="button"
                              id={`btn_view_results_${student.id}`}
                              onClick={() => handleOpenResults(student)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs"
                              title="View Examination Results & Grades"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Results</span>
                            </button>

                            {/* View Detailed Profile / Enrolled Courses */}
                            <button
                              type="button"
                              id={`btn_view_profile_${student.id}`}
                              onClick={() => handleOpenProfile(student)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition"
                              title="View Student Profile & Courses"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>

                            {/* Edit Student Profile */}
                            <button
                              type="button"
                              id={`btn_edit_student_${student.id}`}
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition"
                              title="Edit Student Info & Level"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Change Student Password (Admin Authority) */}
                            <button
                              type="button"
                              id={`btn_change_password_${student.id}`}
                              onClick={() => handleOpenChangePassword(student)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition"
                              title="Change / Reset Candidate Password"
                            >
                              <KeyRound className="w-4 h-4 text-amber-800" />
                            </button>

                            {/* Unlock Button if locked */}
                            {student.is_locked && (
                              <button
                                type="button"
                                id={`btn_unlock_student_${student.id}`}
                                onClick={() => handleUnlockStudent(student)}
                                disabled={isBusy}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition"
                                title="Unlock Account Cooldown"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            )}

                            {/* Activate / Deactivate Button */}
                            <button
                              type="button"
                              id={`btn_toggle_active_${student.id}`}
                              onClick={() => handleToggleActive(student)}
                              disabled={isBusy}
                              className={`p-1.5 rounded-lg border transition ${
                                student.is_active
                                  ? 'bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border-stone-300 hover:border-rose-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                              title={student.is_active ? 'Deactivate Student Account' : 'Activate Student Account'}
                            >
                              {student.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: VIEW STUDENT RESULTS & TRANSCRIPTS */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentForResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-lg font-black text-stone-900">
                      {selectedStudentForResults.full_name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {selectedStudentForResults.matric_no}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    {ACADEMIC_LEVEL_MAP[selectedStudentForResults.level]} • Examination Results &amp; Integrity Verification
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn_close_results_modal"
                onClick={() => setSelectedStudentForResults(null)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoadingResults ? (
                <LoadingSpinner label="Fetching candidate results from tamper-proof ledger..." />
              ) : studentResults.length === 0 ? (
                <div className="py-12 text-center bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 mb-1">No Examination Results Yet</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
                    This student has not submitted any assessments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentResults.map((result) => {
                    const totalQ = result.total_questions || 1;
                    const percentage = Math.round((result.score / totalQ) * 100);
                    const isPassed = percentage >= 50;
                    const verification = verifiedResultsMap[result.id];
                    const isVerifying = verifyingResultId === result.id;

                    return (
                      <div
                        key={result.id}
                        id={`result_item_${result.id}`}
                        className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-700 transition shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                                Exam ID: {result.exam_id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border ${
                                  isPassed
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                              >
                                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {isPassed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-stone-900">{result.exam_title}</h4>
                          </div>

                          <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                              Score (Correct / Total)
                            </span>
                            <div className="flex items-baseline gap-2 sm:justify-end">
                              <span className="font-mono text-2xl font-black text-stone-900">
                                {result.score} <span className="text-sm font-bold text-stone-500">/ {result.total_questions}</span>
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                                  isPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                }`}
                              >
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Submission Metadata & Checksum */}
                        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2 text-stone-500">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>Submitted: {new Date(result.submitted_at).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-stone-400 truncate max-w-[180px]" title={result.checksum}>
                              Hash: {result.checksum ? result.checksum.slice(0, 16) + '...' : 'Sealed'}
                            </span>

                            {/* Verify Checksum Button */}
                            <button
                              type="button"
                              onClick={() => handleVerifyResult(result.id)}
                              disabled={isVerifying}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                verification
                                  ? verification.intact
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                            >
                              <Fingerprint className="w-3.5 h-3.5 text-emerald-800" />
                              <span>{isVerifying ? 'Verifying...' : verification ? (verification.intact ? 'Verified Intact' : 'Mismatch') : 'Verify Checksum'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Verification Details banner if verified */}
                        {verification && (
                          <div
                            className={`mt-2.5 p-2.5 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                              verification.intact
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50/70 border-rose-200 text-rose-900'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-800" />
                            <span>{verification.details}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForResults(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: STUDENT PROFILE & ENROLLED COURSES */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">{selectedStudentForProfile.full_name}</h3>
                  <p className="text-xs text-stone-500 font-medium">Candidate Profile &amp; Auto-Enrolled Curriculum</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">Matriculation No:</span>
                  <span className="font-mono text-stone-900 font-bold text-sm">{selectedStudentForProfile.matric_no}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">Email Address:</span>
                  <span className="font-mono text-stone-800 font-bold">{selectedStudentForProfile.email}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">Current Level:</span>
                  <span className="font-bold text-emerald-900">{ACADEMIC_LEVEL_MAP[selectedStudentForProfile.level]}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">Registered Since:</span>
                  <span className="font-mono text-stone-700">{new Date(selectedStudentForProfile.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Enrolled Courses Section */}
              <div>
                <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-800" />
                    Enrolled Courses ({selectedStudentForProfile.enrolled_courses?.length || 0})
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">Auto-enrolled by level</span>
                </h4>

                {(!selectedStudentForProfile.enrolled_courses || selectedStudentForProfile.enrolled_courses.length === 0) ? (
                  <div className="p-6 text-center rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 font-medium">
                    No courses enrolled for this academic level yet. Admin can create courses in Course Management.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStudentForProfile.enrolled_courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs flex items-start gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {course.code ? course.code.slice(0, 3) : 'CRS'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-emerald-900 block">{course.code}</span>
                          <span className="text-xs font-bold text-stone-900 block truncate">{course.title || course.name}</span>
                          <span className="text-[10px] text-stone-500 block">{ACADEMIC_LEVEL_MAP[course.level] || course.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: EDIT STUDENT PROFILE */}
      {/* ------------------------------------------------------------- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Edit Student Profile</h3>
                  <p className="text-xs text-stone-500 font-mono font-medium">{editingStudent.matric_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                  placeholder="e.g. Adewale Babatunde"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                  placeholder="e.g. adewale@mapoly.edu.ng"
                />
              </div>

              {/* Academic Level */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Academic Level <span className="text-rose-600">*</span>
                </label>
                <select
                  value={editFormData.level}
                  onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value as AcademicLevel })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                >
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 leading-relaxed font-medium">
                  <strong>Notice:</strong> Changing academic level preserves enrollment history in previously assigned courses, and automatically registers the candidate into all active courses for the new level.
                </p>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Saving Updates...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADMIN CHANGE STUDENT PASSWORD */}
      {/* ------------------------------------------------------------- */}
      {passwordModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Set Candidate Password</h3>
                  <p className="text-xs text-stone-500 font-medium">Administrator Examination Security Override</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalStudent(null);
                  setPasswordChangeSuccess(null);
                }}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Pill */}
            <div className="px-6 py-3 bg-stone-100 border-b border-stone-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800">{passwordModalStudent.full_name}</span>
                <span className="text-stone-400 mx-2">•</span>
                <span className="font-mono text-emerald-800 font-bold">{passwordModalStudent.matric_no}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-bold text-[10px]">
                {passwordModalStudent.level}
              </span>
            </div>

            {passwordChangeSuccess ? (
              /* Success View with Credentials Card */
              <div className="p-6 space-y-5 text-center animate-fadeIn" id="admin_password_success_view">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-stone-900">New Password Active</h4>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    The student can now use these credentials to log in on any examination computer.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-300 text-left space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <span className="text-stone-500 font-sans font-bold">Matric Number:</span>
                    <span className="font-bold text-stone-900">{passwordChangeSuccess.matricNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-sans font-bold">New Password:</span>
                    <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {passwordChangeSuccess.newPass}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCredentials(
                        `MAPOLY CBE Login:\nMatric No: ${passwordChangeSuccess.matricNo}\nPassword: ${passwordChangeSuccess.newPass}`
                      )
                    }
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition flex items-center justify-center gap-2"
                  >
                    {copiedToClipboard ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedToClipboard ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModalStudent(null);
                      setPasswordChangeSuccess(null);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Password Change Form */
              <form onSubmit={handleSaveStudentPassword} className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">Admin Authority:</span>
                    As an administrator, updating this password updates the candidate credential record immediately.
                    Any pending reset requests for this matriculation number will automatically be marked resolved.
                  </div>
                </div>

                {/* Password Input + Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      New Password <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Secure Password</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPasswordInModal ? 'text' : 'password'}
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Minimum 8 characters (e.g. Mapoly@2026!)"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPasswordInput && (
                    <p className={`text-[11px] mt-1.5 font-medium ${newPasswordInput.length >= 8 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {newPasswordInput.length >= 8
                        ? `✓ Password length valid (${newPasswordInput.length} chars)`
                        : `Password must be at least 8 characters (${newPasswordInput.length}/8)`}
                    </p>
                  )}
                </div>

                {/* Admin Audit Note */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Audit Note / Reason for Change (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="e.g. Requested by student at Exam Hall 3; verified with student ID card"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPasswordModalStudent(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword || newPasswordInput.trim().length < 8}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isChangingPassword ? 'Setting Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: PENDING PASSWORD RESET REQUESTS */}
      {/* ------------------------------------------------------------- */}
      {showResetRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Candidate Password Reset Requests</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Review and authorize password updates submitted from the login portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetRequestsModal(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {resetRequests.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mx-auto mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 mb-1">No Password Reset Requests</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    When candidates request a password reset from the examination login screen, their requests will appear here for review.
                  </p>
                </div>
              ) : (
                resetRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition ${
                      req.status === 'pending'
                        ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                        : req.status === 'resolved'
                        ? 'bg-stone-50 border-stone-200 opacity-80'
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{req.fullName || 'Candidate'}</span>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            {req.matricNo}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500">{req.email}</span>
                      </div>

                      <div>
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {req.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-300 text-[11px] font-bold">
                            <XCircle className="w-3 h-3" /> Dismissed
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl border border-stone-200 mb-3">
                      <strong>Reason:</strong> {req.reason || 'Candidate requested password reset via portal'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>Requested: {new Date(req.requestedAt).toLocaleString()}</span>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRejectResetRequest(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition border border-stone-300"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveResetRequest(req)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Assign Password</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'resolved' && req.temporaryPasswordAssigned && (
                        <span className="font-mono text-emerald-800 font-bold">
                          Assigned: {req.temporaryPasswordAssigned}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetRequestsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
