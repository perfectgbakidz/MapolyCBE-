import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient, ApiError } from '../services/apiClient';
import { Exam, Question, AnswerRecord, ExamSession } from '../types';
import { CountdownTimer } from '../components/exam/CountdownTimer';
import { QuestionNavigator } from '../components/exam/QuestionNavigator';
import { AutoSaveIndicator } from '../components/exam/AutoSaveIndicator';
import { ConfirmSubmitModal } from '../components/exam/ConfirmSubmitModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  Code2,
  ShieldAlert,
  Shield,
  AlertOctagon,
  Lock,
} from 'lucide-react';

const MAX_TAB_SWITCH_STRIKES = 3;

export const TakeExamPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const { candidateUser } = useAuth();
  const { warning, error, info, success } = useToast();
  const examId = params.examId;

  const [exam, setExam] = useState<Exam | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Background Auto-Save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(undefined);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [lastChecksum, setLastChecksum] = useState<string | undefined>(undefined);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | undefined>(undefined);

  // Submission modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitReason, setSubmitReason] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [strikeWarningModalStrike, setStrikeWarningModalStrike] = useState<number | null>(null);

  // Refs to avoid stale closures in event listeners & timer callbacks
  const answersRef = useRef<Record<string, AnswerRecord>>({});
  answersRef.current = answers;

  const examRef = useRef<Exam | null>(null);
  examRef.current = exam;

  const candidateUserRef = useRef(candidateUser);
  candidateUserRef.current = candidateUser;

  const isSubmittingRef = useRef<boolean>(false);
  isSubmittingRef.current = isSubmitting;

  const tabSwitchCountRef = useRef<number>(0);
  tabSwitchCountRef.current = tabSwitchCount;

  const lastFocusLossTimestampRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize or restore session
  useEffect(() => {
    if (!examId || !candidateUser) return;

    let isMounted = true;
    const initialize = async () => {
      try {
        const examData = await apiClient.getExamById(examId);
        const sessionData = await apiClient.startExamSession(examId, candidateUser.id);

        if (!isMounted) return;
        setExam(examData);
        setSession(sessionData);

        // Preload any existing answers
        if (sessionData.answers) {
          setAnswers(sessionData.answers);
        }
        const initialCount = sessionData.tabSwitchCount || 0;
        setTabSwitchCount(initialCount);
        tabSwitchCountRef.current = initialCount;
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 403) {
          error('Access Denied', "You don't have access to this exam.");
          navigate('/dashboard');
          return;
        }
        const msg = err instanceof Error ? err.message : 'Failed to initialize examination session';
        error('Session Error', msg);
        navigate('/dashboard');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [examId, candidateUser, navigate, error]);

  /**
   * Submit Exam (Grades responses, computes final receipt)
   */
  const handleConfirmSubmit = useCallback(async (forcedReason?: string) => {
    const currentExam = examRef.current;
    const currentCandidate = candidateUserRef.current;
    if (!currentExam || !currentCandidate || isSubmittingRef.current) return;

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    if (forcedReason) setSubmitReason(forcedReason);

    try {
      const currentAnswers = answersRef.current;
      const answersMap: Record<string, { selectedOptionId: string; markedForReview: boolean; timeSpent: number }> = {};
      (Object.values(currentAnswers) as AnswerRecord[]).forEach((a) => {
        if (a.selectedOptionId) {
          answersMap[a.questionId] = {
            selectedOptionId: a.selectedOptionId,
            markedForReview: a.markedForReview,
            timeSpent: a.timeSpentSeconds || 10,
          };
        }
      });

      const result = await apiClient.submitExam(
        currentExam.id,
        currentCandidate,
        answersMap,
        tabSwitchCountRef.current
      );

      navigate(
        `/exam/${currentExam.id}/submitted?receipt=${encodeURIComponent(result.receiptChecksum)}&score=${result.score}&total=${result.totalScore}&percentage=${result.percentage}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize submission';
      error('Submission Error', msg);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setSubmitReason(null);
    }
  }, [navigate, error]);

  // Tab switch & Window focus detection with 3-Strike Limit
  useEffect(() => {
    if (!examId || !candidateUser) return;

    const handleFocusLoss = async () => {
      if (isSubmittingRef.current) return;

      const now = Date.now();
      // Debounce focus loss events within 1.5s to prevent double-firing from blur + visibilitychange
      if (now - lastFocusLossTimestampRef.current < 1500) {
        return;
      }
      lastFocusLossTimestampRef.current = now;

      try {
        const count = await apiClient.recordTabSwitch(examId, candidateUser.id);
        setTabSwitchCount(count);
        tabSwitchCountRef.current = count;

        if (count === 1) {
          warning(
            'Anti-Cheat Warning (Strike 1 of 3)',
            'Window focus lost or tab switched. You have 2 strikes remaining before automatic submission.'
          );
          setStrikeWarningModalStrike(1);
        } else if (count === 2) {
          warning(
            'FINAL WARNING (Strike 2 of 3)',
            'Critical proctoring alert! 1 more tab switch or window loss will trigger immediate exam auto-submission!'
          );
          setStrikeWarningModalStrike(2);
        } else if (count >= MAX_TAB_SWITCH_STRIKES) {
          error(
            'Strike Limit Reached (3 of 3)',
            'Maximum allowed window deviations exceeded. Automatically sealing and submitting exam...'
          );
          setStrikeWarningModalStrike(null);
          handleConfirmSubmit('ANTI_CHEAT_STRIKE_LIMIT');
        }
      } catch {
        // quiet
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLoss();
      }
    };

    const onWindowBlur = () => {
      handleFocusLoss();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [examId, candidateUser, warning, error, handleConfirmSubmit]);

  const currentQuestion: Question | undefined = exam?.questions?.[currentIndex];

  /**
   * CRITICAL ACTION: Select option with immediate background write
   * UI updates instantaneously (optimistic state) while the network call persists to server
   */
  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!currentQuestion || !exam || !candidateUser) return;

      const qId = currentQuestion.id;
      const existingAnswer = answers[qId];
      const markedForReview = existingAnswer?.markedForReview ?? false;
      const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

      // 1. Instant Optimistic UI update
      const optimisticRecord: AnswerRecord = {
        questionId: qId,
        selectedOptionId: optionId,
        markedForReview,
        answeredAt: new Date().toISOString(),
        timeSpentSeconds: (existingAnswer?.timeSpentSeconds || 0) + timeSpent,
        checksum: 'COMPUTING...',
        syncStatus: 'pending',
      };

      setAnswers((prev) => ({
        ...prev,
        [qId]: optimisticRecord,
      }));
      setSaveStatus('saving');
      setSaveErrorMsg(undefined);

      // 2. Dispatch background API write
      try {
        const res = await apiClient.saveAnswer(
          exam.id,
          candidateUser.id,
          qId,
          optionId,
          markedForReview,
          optimisticRecord.timeSpentSeconds
        );

        // 3. Mark as successfully synced with server checksum
        setAnswers((prev) => ({
          ...prev,
          [qId]: {
            ...prev[qId],
            checksum: res.checksum,
            syncStatus: 'synced',
            syncLatencyMs: res.latencyMs,
          },
        }));

        setSaveStatus('saved');
        setLastSavedAt(new Date().toISOString());
        setLatencyMs(res.latencyMs);
        setLastChecksum(res.checksum);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Background sync error';
        setSaveStatus('error');
        setSaveErrorMsg(msg);
        setAnswers((prev) => ({
          ...prev,
          [qId]: {
            ...prev[qId],
            syncStatus: 'failed',
          },
        }));
        error('Auto-Save Fault', msg);
      }
    },
    [currentQuestion, exam, candidateUser, answers, error]
  );

  /**
   * Toggle Marked for Review flag
   */
  const handleToggleFlag = async () => {
    if (!currentQuestion || !exam || !candidateUser) return;
    const qId = currentQuestion.id;
    const existing = answers[qId];
    const newFlagState = !existing?.markedForReview;

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        selectedOptionId: existing?.selectedOptionId || '',
        markedForReview: newFlagState,
        answeredAt: existing?.answeredAt || new Date().toISOString(),
        timeSpentSeconds: existing?.timeSpentSeconds || 0,
        checksum: existing?.checksum || '',
        syncStatus: 'synced',
      },
    }));

    if (existing?.selectedOptionId) {
      try {
        await apiClient.saveAnswer(
          exam.id,
          candidateUser.id,
          qId,
          existing.selectedOptionId,
          newFlagState,
          existing.timeSpentSeconds || 0
        );
      } catch {
        // silent
      }
    }
  };

  /**
   * Clear current question's selected answer
   */
  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
    info('Selection Cleared', `Removed choice for Question #${currentIndex + 1}`);
  };

  /**
   * Navigate between questions
   */
  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && exam?.questions && index < exam.questions.length) {
      setCurrentIndex(index);
      questionStartTimeRef.current = Date.now();
    }
  };

  /**
   * Auto submit when timer runs out
   */
  const handleTimeExpire = useCallback(() => {
    warning('Time Limit Reached', 'The allotted duration has elapsed. Auto-sealing your responses now...');
    handleConfirmSubmit('TIME_EXPIRED');
  }, [handleConfirmSubmit, warning]);

  // Keyboard shortcut listener (1-4 or A-D to choose option, Arrows for next/prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or modal is open
      if (isSubmitModalOpen || isSubmitting || strikeWarningModalStrike !== null) return;

      if (e.key === 'ArrowRight') {
        if (exam?.questions && currentIndex < exam.questions.length - 1) {
          handleJumpToQuestion(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handleJumpToQuestion(currentIndex - 1);
        }
      } else if (['1', 'a', 'A'].includes(e.key)) {
        handleSelectOption('A');
      } else if (['2', 'b', 'B'].includes(e.key)) {
        handleSelectOption('B');
      } else if (['3', 'c', 'C'].includes(e.key)) {
        handleSelectOption('C');
      } else if (['4', 'd', 'D'].includes(e.key)) {
        handleSelectOption('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, exam, isSubmitModalOpen, isSubmitting, strikeWarningModalStrike, handleSelectOption]);

  if (isLoading || !exam || !session) {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
        <LoadingSpinner label="Securing examination environment..." sublabel="Enforcing anti-tamper protocol & verifying cryptographic keys..." />
      </div>
    );
  }

  const totalQuestions = exam.questions?.length || exam.totalQuestions;
  const answeredCount = (Object.values(answers) as AnswerRecord[]).filter((a) => a.selectedOptionId).length;
  const flaggedCount = (Object.values(answers) as AnswerRecord[]).filter((a) => a.markedForReview).length;
  const isCurrentFlagged = currentQuestion ? Boolean(answers[currentQuestion.id]?.markedForReview) : false;
  const currentSelectedOption = currentQuestion ? answers[currentQuestion.id]?.selectedOptionId : undefined;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-800/20">
      {/* Top Fixed Examination Header */}
      <header
        id="exam_active_header"
        className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs py-2.5 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Exam title & Candidate Reg */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              CBT
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate max-w-[200px] sm:max-w-md">
                {exam.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-stone-600 font-mono font-medium">
                <span>{candidateUser?.name}</span>
                <span>•</span>
                <span className="text-emerald-800 font-bold">{candidateUser?.regNumber}</span>
              </div>
            </div>
          </div>

          {/* Center/Right: Anti-Cheat Badge, Live Sync Status, Timer, Submit */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Anti-cheat status pill */}
            <div
              id="anti_cheat_status_badge"
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                tabSwitchCount === 0
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : tabSwitchCount === 1
                  ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-rose-50 text-rose-900 border-rose-300 animate-bounce'
              }`}
            >
              {tabSwitchCount === 0 ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Proctoring: 0/{MAX_TAB_SWITCH_STRIKES} Strikes</span>
                </>
              ) : tabSwitchCount === 1 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Strike 1/{MAX_TAB_SWITCH_STRIKES} (Warning)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                  <span>Strike 2/{MAX_TAB_SWITCH_STRIKES} (FINAL WARNING)</span>
                </>
              )}
            </div>

            <AutoSaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              latencyMs={latencyMs}
              lastChecksum={lastChecksum}
              errorMessage={saveErrorMsg}
            />

            <div className="w-32 sm:w-44">
              <CountdownTimer
                expiresAt={session.expiresAt}
                durationMinutes={exam.durationMinutes}
                onTimeExpire={handleTimeExpire}
              />
            </div>

            <button
              type="button"
              id="submit_exam_header_btn"
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish &amp; Submit</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Anti-Cheat Proctoring Alert Banner */}
      {tabSwitchCount === 1 && (
        <div
          id="strike_warning_banner_1"
          className="bg-amber-500 text-stone-950 font-medium text-xs px-4 py-2.5 text-center flex items-center justify-center gap-2 border-b border-amber-600 shadow-xs"
        >
          <AlertTriangle className="w-4 h-4 text-stone-950 shrink-0" />
          <span>
            <strong>Anti-Cheat Strike 1 of 3:</strong> Window focus loss or tab switch detected. You have <strong>2 strikes remaining</strong> before your examination is automatically locked and submitted.
          </span>
        </div>
      )}

      {tabSwitchCount === 2 && (
        <div
          id="strike_warning_banner_2"
          className="bg-rose-600 text-white font-bold text-xs px-4 py-2.5 text-center flex items-center justify-center gap-2 border-b border-rose-700 animate-pulse shadow-xs"
        >
          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
          <span>
            <strong>CRITICAL WARNING (Strike 2 of 3):</strong> Any further tab switch, window minimization, or loss of focus will trigger <strong>IMMEDIATE AUTOMATIC SUBMISSION</strong>!
          </span>
        </div>
      )}

      {tabSwitchCount >= MAX_TAB_SWITCH_STRIKES && (
        <div
          id="strike_warning_banner_3"
          className="bg-stone-900 text-rose-300 font-bold text-xs px-4 py-3 text-center flex items-center justify-center gap-2 border-b border-stone-800"
        >
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>STRIKE LIMIT EXCEEDED (3 of 3):</strong> Exam is locked due to proctoring policy violation. Automatically submitting all answers...
          </span>
        </div>
      )}

      {/* Main Exam Canvas Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Column: Question Panel (8 cols) */}
        <section className="lg:col-span-8 space-y-6" id="exam_question_panel">
          {currentQuestion ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              {/* Question Header & Controls */}
              <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    of {totalQuestions} Questions
                  </span>
                  {currentQuestion.category && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold">
                      {currentQuestion.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-stone-600 mr-2">
                    +{currentQuestion.points} Points
                  </span>

                  {/* Flag / Mark for Review button */}
                  <button
                    type="button"
                    id="flag_question_btn"
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isCurrentFlagged
                        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                        : 'bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-current text-amber-600' : ''}`} />
                    <span>{isCurrentFlagged ? 'Flagged' : 'Flag for Review'}</span>
                  </button>

                  {/* Clear Selection */}
                  {currentSelectedOption && (
                    <button
                      type="button"
                      id="clear_answer_btn"
                      onClick={handleClearAnswer}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                      title="Clear selection"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Statement Text */}
              <div className="mb-6">
                <p className="text-base sm:text-lg font-semibold text-stone-900 leading-relaxed">
                  {currentQuestion.text}
                </p>

                {/* Optional Code Snippet */}
                {currentQuestion.codeSnippet && (
                  <div className="mt-4 rounded-xl bg-stone-900 border border-stone-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold mb-2 pb-1 border-b border-stone-800">
                      <Code2 className="w-3 h-3" />
                      <span>Code Snippet</span>
                    </div>
                    <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options A, B, C, D (4 OptionButtons) */}
              <div className="space-y-3 pt-2" id="exam_option_buttons_container">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentSelectedOption === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      id={`option_btn_${option.id}`}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-700 ring-2 ring-emerald-700 text-stone-900 shadow-sm scale-[1.005]'
                          : 'bg-stone-50/70 hover:bg-stone-100/80 border-stone-200 hover:border-stone-300 text-stone-800'
                      }`}
                    >
                      {/* Option Key Badge */}
                      <span
                        className={`w-8 h-8 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-white text-stone-700 group-hover:bg-stone-200 group-hover:text-stone-900 border border-stone-300'
                        }`}
                      >
                        {option.id}
                      </span>

                      {/* Option Text */}
                      <span className="flex-1 text-sm pt-1 leading-relaxed font-medium">
                        {option.text}
                      </span>

                      {/* Checkmark when chosen */}
                      {isSelected && (
                        <div className="shrink-0 text-emerald-800 pt-1">
                          <CheckCircle className="w-5 h-5 fill-emerald-100 text-emerald-800" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Keyboard shortcuts tip */}
              <p className="text-[11px] text-stone-500 font-mono mt-5 text-right hidden sm:block font-medium">
                Hotkeys: Press [1-4] or [A-D] to select • [← / →] to navigate questions
              </p>

              {/* Navigation Controls (Prev / Next) */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  id="btn_prev_question"
                  onClick={() => handleJumpToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-stone-600 font-mono font-bold">
                  {currentIndex + 1} / {totalQuestions}
                </div>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    id="btn_next_question"
                    onClick={() => handleJumpToQuestion(currentIndex + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs hover:scale-[1.01]"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn_finish_to_submit"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Review &amp; Submit</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p>No question loaded</p>
            </div>
          )}
        </section>

        {/* Right Column: Question Navigator Palette (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <QuestionNavigator
            questions={exam.questions || []}
            currentIndex={currentIndex}
            answers={answers}
            onSelectQuestion={handleJumpToQuestion}
          />

          {/* Quick Summary Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 text-xs space-y-3 shadow-xs">
            <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[11px] pb-2 border-b border-stone-200">
              Session Progress
            </h4>
            <div className="flex justify-between text-stone-600">
              <span>Answered:</span>
              <span className="font-mono text-emerald-800 font-bold">{answeredCount} of {totalQuestions}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Marked for Review:</span>
              <span className="font-mono text-amber-700 font-bold">{flaggedCount}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Unanswered:</span>
              <span className="font-mono text-rose-700 font-bold">{totalQuestions - answeredCount}</span>
            </div>

            {/* Anti-cheat status in summary box */}
            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[11px]">
              <span className="text-stone-500">Proctoring Violations:</span>
              <span className={`font-mono font-bold ${tabSwitchCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {tabSwitchCount} / {MAX_TAB_SWITCH_STRIKES} Strikes
              </span>
            </div>

            <button
              type="button"
              id="sidebar_submit_exam_btn"
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Examination
            </button>
          </div>
        </aside>
      </main>

      {/* Strike Warning Interstitial Modal (For Strikes 1 & 2) */}
      {strikeWarningModalStrike !== null && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            id="strike_warning_acknowledgment_modal"
            className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  strikeWarningModalStrike === 1
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {strikeWarningModalStrike === 1
                    ? 'Anti-Cheat Warning (Strike 1 of 3)'
                    : 'FINAL WARNING (Strike 2 of 3)'}
                </h3>
                <p className="text-xs text-stone-500 font-mono">Window Focus Loss Detected</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium ${
                strikeWarningModalStrike === 1
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-950 font-semibold'
              }`}
            >
              {strikeWarningModalStrike === 1 ? (
                <p>
                  You navigated away from the exam window or switched tabs. You now have{' '}
                  <strong>2 strikes remaining</strong>. If you switch tabs 2 more times, the system will{' '}
                  <strong>automatically submit and lock your exam immediately</strong>.
                </p>
              ) : (
                <p>
                  <strong>This is your final warning!</strong> You have accumulated 2 strikes. Switching tabs, minimizing the browser, or opening another application one more time will{' '}
                  <strong>instantly force-submit and terminate your examination</strong>.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="btn_acknowledge_strike_warning"
                onClick={() => setStrikeWarningModalStrike(null)}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-xs transition ${
                  strikeWarningModalStrike === 1
                    ? 'bg-amber-700 hover:bg-amber-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                I Understand &amp; Resume Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Submitting Lock Overlay (for Strike 3 or Expired time) */}
      {isSubmitting && submitReason && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-2xl border border-stone-200 space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-stone-900">
              {submitReason === 'ANTI_CHEAT_STRIKE_LIMIT'
                ? 'Exam Terminated & Auto-Submitted'
                : 'Submitting Examination Responses'}
            </h3>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              {submitReason === 'ANTI_CHEAT_STRIKE_LIMIT'
                ? 'Maximum tab switch violations (3 of 3 strikes) reached. All saved responses are being sealed and graded...'
                : 'Session duration expired. Finalizing answer receipt and calculating score...'}
            </p>
            <div className="pt-2 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Encrypting &amp; submitting...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Confirmation Modal */}
      <ConfirmSubmitModal
        isOpen={isSubmitModalOpen}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        isSubmitting={isSubmitting}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => handleConfirmSubmit()}
      />
    </div>
  );
};
