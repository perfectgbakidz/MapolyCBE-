import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { apiClient, ApiError } from '../services/apiClient';
import {
  ChildSummary,
  ChildExamStatus,
  ChildResultWithExam,
  ACADEMIC_LEVEL_MAP,
} from '../types';
import {
  Users,
  User,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Printer,
  Copy,
  Hash,
  ChevronRight,
  LogOut,
  FileText,
  BadgeCheck,
  X,
} from 'lucide-react';

export const ParentDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { parentUser, logoutParent } = useAuth();
  const { success, error, info } = useToast();

  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildSummary | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  const [exams, setExams] = useState<ChildExamStatus[]>([]);
  const [results, setResults] = useState<ChildResultWithExam[]>([]);
  const [isLoadingChildData, setIsLoadingChildData] = useState(false);

  const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'overview'>('exams');
  const [examFilter, setExamFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Printable Result Slip Modal
  const [slipResult, setSlipResult] = useState<ChildResultWithExam | null>(null);
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  // Fetch children on load
  const fetchChildren = useCallback(async () => {
    setIsLoadingChildren(true);
    try {
      const list = await apiClient.getParentChildren();
      setChildren(list);
      if (list.length > 0) {
        // Default to first child or maintain selected
        setSelectedChild((prev) => {
          if (prev && list.some((c) => c.id === prev.id)) {
            return prev;
          }
          return list[0];
        });
      } else {
        setSelectedChild(null);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        logoutParent();
        navigate('/parent/login');
        return;
      }
      const msg = err instanceof Error ? err.message : 'Unable to load registered children.';
      error('Error', msg);
    } finally {
      setIsLoadingChildren(false);
    }
  }, [error, logoutParent, navigate]);

  // Fetch child exams and results when selectedChild changes
  const fetchChildData = useCallback(async (candidateId: string) => {
    setIsChildDataLoading(true);
    try {
      const [examsData, resultsData] = await Promise.all([
        apiClient.getChildExams(candidateId),
        apiClient.getChildResults(candidateId),
      ]);
      setExams(examsData || []);
      setResults(resultsData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch academic records for this ward.';
      error('Data Load Error', msg);
    } finally {
      setIsLoadingChildData(false);
    }
  }, [error]);

  const setIsChildDataLoading = (val: boolean) => setIsLoadingChildData(val);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.id);
    } else {
      setExams([]);
      setResults([]);
    }
  }, [selectedChild, fetchChildData]);

  const handleCopyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(true);
    info('Copied', 'Cryptographic SHA-256 Checksum copied to clipboard.');
    setTimeout(() => setCopiedChecksum(false), 2500);
  };

  const calculateGrade = (score: number, total: number) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    if (percentage >= 75) return { grade: 'Distinction (A)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (percentage >= 65) return { grade: 'Upper Credit (AB)', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (percentage >= 50) return { grade: 'Lower Credit (B/BC)', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (percentage >= 40) return { grade: 'Pass (C)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { grade: 'Fail (F)', color: 'text-red-700 bg-red-50 border-red-300' };
  };

  // Metrics
  const totalExams = exams.length;
  const completedExams = exams.filter((e) => e.done).length;
  const pendingExams = totalExams - completedExams;
  const averagePercentage = results.length > 0
    ? Math.round(
        results.reduce((acc, r) => acc + (r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0), 0) /
          results.length
      )
    : 0;

  // Filtered exams
  const filteredExams = exams.filter((exam) => {
    if (examFilter === 'done' && !exam.done) return false;
    if (examFilter === 'pending' && exam.done) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = exam.title.toLowerCase().includes(q);
      const matchCourse = (exam.course_id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn">
        {/* Top Header Card */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Parent & Guardian Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                  Verified Guardian
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Logged in as <strong className="text-stone-800">{parentUser?.full_name || 'Parent / Guardian'}</strong>{' '}
                ({parentUser?.phone_number || 'Mobile'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              id="parent_refresh_data_btn"
              onClick={() => {
                fetchChildren();
                if (selectedChild) fetchChildData(selectedChild.id);
                success('Refreshed', 'Academic data updated from central examination server.');
              }}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              id="parent_logout_btn"
              onClick={() => {
                logoutParent();
                navigate('/parent/login');
              }}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Wards Selector Tabs / Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-700" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Linked Wards & Children ({children.length})
              </h2>
            </div>
            <button
              type="button"
              id="parent_link_more_wards_btn"
              onClick={() => navigate('/parent/register')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold hover:underline"
            >
              + Register New Account / Ward
            </button>
          </div>

          {isLoadingChildren ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Fetching linked children from central examination server...</span>
            </div>
          ) : children.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-amber-900 mb-1">No Wards Currently Linked</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto mb-4">
                We did not find any candidates linked to your account. This may happen if the child&apos;s name did not exactly match their registered student profile during registration.
              </p>
              <button
                type="button"
                onClick={() => navigate('/parent/register')}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs transition"
              >
                Link Wards in Registry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {children.map((child) => {
                const isSelected = selectedChild?.id === child.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    id={`select_child_${child.id}`}
                    onClick={() => setSelectedChild(child)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3.5 relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-indigo-300 hover:bg-stone-50/60 shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {child.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-stone-900 truncate">
                          {child.full_name}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-mono text-stone-500 mt-0.5 truncate">
                        {child.matric_no}
                      </p>
                      <div className="mt-1">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700">
                          {ACADEMIC_LEVEL_MAP[child.level] || child.level}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Child Academic Space */}
        {selectedChild && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Total Scheduled</span>
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {isLoadingChildData ? '...' : totalExams}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Exams for {selectedChild.level}</p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Exams Completed</span>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {isLoadingChildData ? '...' : completedExams}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {totalExams > 0 ? `${Math.round((completedExams / totalExams) * 100)}% progress` : '0%'}
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending / Open</span>
                </div>
                <div className="text-2xl font-black text-amber-700">
                  {isLoadingChildData ? '...' : pendingExams}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Awaiting submission</p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Cumulative Avg.</span>
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {isLoadingChildData ? '...' : results.length > 0 ? `${averagePercentage}%` : 'N/A'}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {results.length > 0 ? `${results.length} graded result(s)` : 'No results yet'}
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="tab_exams_btn"
                  onClick={() => setActiveTab('exams')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'exams'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Scheduled & Available Exams ({exams.length})</span>
                </button>

                <button
                  type="button"
                  id="tab_results_btn"
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'results'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Verified Results & Transcripts ({results.length})</span>
                </button>

                <button
                  type="button"
                  id="tab_overview_btn"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ward Profile & Security</span>
                </button>
              </div>
            </div>

            {/* TAB 1: ALL EXAMS */}
            {activeTab === 'exams' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="parent_exam_search_input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exam title or course code..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setExamFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        examFilter === 'all'
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      All ({exams.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamFilter('done')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        examFilter === 'done'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Completed ({completedExams})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        examFilter === 'pending'
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      Pending ({pendingExams})
                    </button>
                  </div>
                </div>

                {isLoadingChildData ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading ward examination schedules...</span>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
                    <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-stone-800 mb-1">No Examinations Found</h3>
                    <p className="text-xs text-stone-500">
                      {searchQuery
                        ? 'No examinations match your search criteria.'
                        : 'No examinations are currently scheduled for this academic level.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExams.map((exam) => {
                      const isDone = exam.done;
                      return (
                        <div
                          key={exam.exam_id}
                          className={`bg-white rounded-2xl border p-5 transition hover:shadow-xs flex flex-col justify-between ${
                            isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                {exam.course_id || 'COURSE'}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : exam.is_active
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-stone-100 text-stone-600 border border-stone-300'
                                }`}
                              >
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Completed</span>
                                  </>
                                ) : exam.is_active ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                                    <span>Active / Open</span>
                                  </>
                                ) : (
                                  <>
                                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Upcoming</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-stone-900 leading-snug mb-1">
                              {exam.title}
                            </h3>
                            <p className="text-xs text-stone-500 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {exam.duration_minutes} Minutes
                              </span>
                              <span>&bull;</span>
                              <span>{ACADEMIC_LEVEL_MAP[exam.level] || exam.level}</span>
                            </p>
                          </div>

                          {/* Result Pill if Completed */}
                          {isDone && exam.result && (
                            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                              <div>
                                <span className="text-[11px] text-stone-500 block">Candidate Score:</span>
                                <div className="text-sm font-black text-emerald-800">
                                  {exam.result.score} / {exam.result.total_questions}{' '}
                                  <span className="text-xs font-bold text-emerald-600">
                                    (
                                    {Math.round(
                                      (exam.result.score / exam.result.total_questions) * 100
                                    )}
                                    %)
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 bg-white px-2 py-1 rounded border border-stone-200">
                                SHA256: {exam.result.checksum?.slice(0, 8)}...
                              </span>
                            </div>
                          )}

                          {!isDone && (
                            <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
                              <span>Exam Status</span>
                              <span className="font-semibold text-stone-700">
                                {exam.is_active ? 'Candidate may sit exam' : 'Not yet active'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VERIFIED RESULTS & TRANSCRIPTS */}
            {activeTab === 'results' && (
              <div className="space-y-4">
                {isLoadingChildData ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading verified academic results...</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
                    <Award className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-stone-800 mb-1">No Exam Results Recorded Yet</h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Your ward has not completed any examinations yet. As soon as an exam is submitted, the score and tamper-evident cryptographic checksum will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((res) => {
                      const gradeInfo = calculateGrade(res.score, res.total_questions);
                      const percent = res.total_questions > 0 ? Math.round((res.score / res.total_questions) * 100) : 0;
                      return (
                        <div
                          key={res.id}
                          className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                                OFFICIAL RECORD
                              </span>
                              <span className="text-xs text-stone-400">
                                Submitted:{' '}
                                {res.submitted_at
                                  ? new Date(res.submitted_at).toLocaleString()
                                  : 'Recent Session'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-stone-900">{res.exam_title}</h3>
                            <div className="flex items-center gap-2 pt-1 text-xs">
                              <span className="text-stone-500">Tamper Seal:</span>
                              <button
                                type="button"
                                onClick={() => handleCopyChecksum(res.checksum)}
                                className="font-mono text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1 transition"
                                title="Click to copy full SHA-256 hash"
                              >
                                <Hash className="w-3 h-3 text-stone-400" />
                                <span>{res.checksum?.slice(0, 16)}...</span>
                                <Copy className="w-3 h-3 text-stone-400 ml-0.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                            <div className="text-right">
                              <div className="text-xl font-black text-stone-900">
                                {res.score} / {res.total_questions}
                              </div>
                              <div className="text-xs font-bold text-stone-600">
                                Score: {percent}%
                              </div>
                            </div>

                            <div className={`px-3 py-1.5 rounded-xl border text-xs font-black ${gradeInfo.color}`}>
                              {gradeInfo.grade}
                            </div>

                            <button
                              type="button"
                              id={`view_slip_btn_${res.id}`}
                              onClick={() => setSlipResult(res)}
                              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                              title="View and Print Result Slip"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Slip</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WARD PROFILE & ACADEMIC SECURITY */}
            {activeTab === 'overview' && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-stone-900 mb-1">
                    Student Information & Academic Identity
                  </h3>
                  <p className="text-xs text-stone-500">
                    Official records synchronized with Moshood Abiola Polytechnic Departmental CBE Database.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Candidate Full Name
                    </span>
                    <span className="text-sm font-black text-stone-900">{selectedChild.full_name}</span>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Matriculation / Reg Number
                    </span>
                    <span className="text-sm font-mono font-bold text-indigo-700">
                      {selectedChild.matric_no}
                    </span>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Academic Level & Program
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      {ACADEMIC_LEVEL_MAP[selectedChild.level] || selectedChild.level}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <span>Anti-Cheat & Cryptographic Verification Policies</span>
                  </div>
                  <ul className="text-xs text-indigo-900 space-y-2 list-disc pl-5 leading-relaxed">
                    <li>
                      <strong>3-Strike Rule Active:</strong> Candidate browsers automatically detect tab switching or window minimizing. After 2 strike warnings, the 3rd strike automatically locks and submits the examination session.
                    </li>
                    <li>
                      <strong>SHA-256 Tamper-Proof Seal:</strong> Every submitted exam is cryptographically signed with candidate identity, timestamp, and responses. Any unauthorized score alteration fails validation.
                    </li>
                    <li>
                      <strong>Real-Time Response Sync:</strong> Candidate responses are streamed immediately to the central examination server as they choose answers, preventing loss of work during power or connection drops.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRINTABLE RESULT SLIP MODAL */}
        {slipResult && selectedChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-5">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900 uppercase">
                      Moshood Abiola Polytechnic
                    </h3>
                    <p className="text-[11px] text-stone-500">Official Candidate Result Verification Slip</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="close_slip_modal_btn"
                  onClick={() => setSlipResult(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student & Exam Info Grid */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Candidate Name:</span>
                  <span className="font-bold text-stone-900">{selectedChild.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Matriculation No:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedChild.matric_no}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Academic Level:</span>
                  <span className="font-bold text-stone-800">
                    {ACADEMIC_LEVEL_MAP[selectedChild.level] || selectedChild.level}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Exam Title:</span>
                  <span className="font-bold text-stone-900">{slipResult.exam_title}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Date Completed:</span>
                  <span className="font-semibold text-stone-700">
                    {slipResult.submitted_at
                      ? new Date(slipResult.submitted_at).toLocaleString()
                      : 'Recently Completed'}
                  </span>
                </div>
              </div>

              {/* Score Display */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center space-y-1">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Verified Examination Score
                </span>
                <div className="text-3xl font-black text-indigo-950">
                  {slipResult.score} / {slipResult.total_questions}
                </div>
                <div className="text-xs font-bold text-indigo-700">
                  Percentage:{' '}
                  {slipResult.total_questions > 0
                    ? Math.round((slipResult.score / slipResult.total_questions) * 100)
                    : 0}
                  % &bull; {calculateGrade(slipResult.score, slipResult.total_questions).grade}
                </div>
              </div>

              {/* Cryptographic Checksum Seal */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-1">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Tamper-Evident SHA-256 Checksum:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyChecksum(slipResult.checksum)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    {copiedChecksum ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <div className="font-mono text-[10px] break-all text-stone-700 bg-white p-2 rounded border border-stone-200">
                  {slipResult.checksum}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSlipResult(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
