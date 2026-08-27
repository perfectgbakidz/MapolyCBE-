import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient, ApiError } from '../services/apiClient';
import { Exam } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FileCheck2,
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  Lock,
  Wifi,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const ExamInstructionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const { candidateUser } = useAuth();
  const { error: showErrorToast } = useToast();
  const examId = params.examId;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  useEffect(() => {
    if (!examId) return;

    const fetchExamAndQuestions = async () => {
      try {
        const [examData, questionsData] = await Promise.all([
          apiClient.getExamById(examId),
          apiClient.getExamQuestions(examId),
        ]);
        setExam(examData);
        setQuestionCount(questionsData.length || examData.totalQuestions || 0);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 403) {
          showErrorToast('Access Denied', "You don't have access to this exam.");
          navigate('/dashboard');
          return;
        }
        setErrorMsg(err instanceof Error ? err.message : 'Examination details could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamAndQuestions();
  }, [examId, navigate, showErrorToast]);

  const handleBeginExam = () => {
    if (!exam) return;
    setIsStarting(true);

    // Generate a client-side UUID session_id for this attempt
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Navigate to /exam/:examId/take passing the session ID in route state
    navigate(`/exam/${exam.id}/take`, { sessionId, examId: exam.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col">
        <Navbar />
        <LoadingSpinner label="Loading examination rules & parameters..." />
        <Footer />
      </div>
    );
  }

  if (errorMsg || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-900 mb-2">Examination Unavailable</h2>
            <p className="text-xs text-stone-600 mb-6 font-medium">{errorMsg || 'The requested examination could not be found.'}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition shadow-xs"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const standardRules = [
    'Do not refresh the browser or click the back button during the examination.',
    'Anti-Cheat 3-Strike Policy: Do not switch tabs, minimize the browser, or open other windows. Tab deviations are logged. On the 3rd strike, your examination will automatically submit and lock immediately.',
    'Answers save automatically in real-time on every selection with cryptographic checksum verification.',
    'You can navigate freely between questions and flag questions for review before submitting.',
    'The examination will automatically seal and submit when the countdown timer reaches 00:00:00.',
    'Ensure you have a stable network connection before starting.',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back Navigation */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 mb-6 transition font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Instructions Container Card */}
        <div
          id="exam_instructions_card"
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-stone-200 pb-6 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 font-mono text-xs font-bold border border-emerald-300">
                {exam.code}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                {exam.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-3">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-medium">
              {exam.description}
            </p>
          </div>

          {/* Badges: Number of questions & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Duration Badge */}
            <div id="badge_duration" className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 uppercase font-bold block">Duration</span>
                <span className="font-mono text-base font-bold text-stone-900">{exam.durationMinutes} Minutes</span>
              </div>
            </div>

            {/* Question Count Badge */}
            <div id="badge_question_count" className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 uppercase font-bold block">Questions</span>
                <span className="font-mono text-base font-bold text-stone-900">
                  {questionCount} Questions
                </span>
              </div>
            </div>

            {/* Passing Score Badge */}
            <div id="badge_passing_score" className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 uppercase font-bold block">Pass Benchmark</span>
                <span className="font-mono text-base font-bold text-emerald-800">{exam.passingScorePercent}%</span>
              </div>
            </div>
          </div>

          {/* Bullet List of Rules */}
          <div className="mb-8">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-800" />
              Examination Rules &amp; Proctoring Guidelines
            </h2>

            <div className="space-y-2.5">
              {standardRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Environment Status */}
          <div className="mb-8 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs text-stone-600 font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-800 font-medium">
                <Wifi className="w-4 h-4 text-emerald-800" />
                Real-Time AutoSave:
              </span>
              <span className="text-emerald-800 font-bold">Background Sync Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-800 font-medium">
                <Lock className="w-4 h-4 text-emerald-800" />
                Anti-Tamper Sealing:
              </span>
              <span className="text-emerald-800 font-bold">HMAC Signature Generation</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-800 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Focus Proctoring:
              </span>
              <span className="text-amber-800 font-bold">Active (3-Strike Auto-Submit)</span>
            </div>
          </div>

          {/* Candidate Acknowledgement */}
          <div className="mb-8 p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 flex items-start gap-3">
            <input
              type="checkbox"
              id="agree_instructions_checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
            />
            <label htmlFor="agree_instructions_checkbox" className="text-xs text-stone-800 cursor-pointer leading-relaxed font-medium">
              I certify that I am <strong className="text-stone-900">{candidateUser?.name || 'Candidate'}</strong> (Matric No: <span className="font-mono text-emerald-900 font-bold">{candidateUser?.regNumber || 'CBT/2026/CS/0492'}</span>). I understand the timer starts immediately upon clicking Begin Exam.
            </label>
          </div>

          {/* Begin Exam Button */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              id="begin_exam_btn"
              onClick={handleBeginExam}
              disabled={!agreedTerms || isStarting}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isStarting ? 'Starting Exam Session...' : 'Begin Exam'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
