import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
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
} from 'lucide-react';

export const TakeExamPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const { candidateUser } = useAuth();
  const { warning, error, info } = useToast();
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
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // Question timer
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
        setTabSwitchCount(sessionData.tabSwitchCount || 0);
      } catch (err: unknown) {
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

  // Tab switch & Window focus detection
  useEffect(() => {
    if (!examId || !candidateUser || isSubmitting) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          const count = await apiClient.recordTabSwitch(examId, candidateUser.id);
          setTabSwitchCount(count);
          warning(
            'Security Warning: Window Focus Lost',
            `Tab switch detected (Violation #${count}). All focus events are recorded on the proctoring log.`
          );
        } catch {
          // quiet
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examId, candidateUser, isSubmitting, warning]);

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
   * Submit Exam (Grades responses, computes final receipt)
   */
  const handleConfirmSubmit = async () => {
    if (!exam || !candidateUser) return;
    setIsSubmitting(true);

    try {
      const answersMap: Record<string, { selectedOptionId: string; markedForReview: boolean; timeSpent: number }> = {};
      (Object.values(answers) as AnswerRecord[]).forEach((a) => {
        if (a.selectedOptionId) {
          answersMap[a.questionId] = {
            selectedOptionId: a.selectedOptionId,
            markedForReview: a.markedForReview,
            timeSpent: a.timeSpentSeconds || 10,
          };
        }
      });

      const result = await apiClient.submitExam(
        exam.id,
        candidateUser,
        answersMap,
        tabSwitchCount
      );

      navigate(`/exam/${exam.id}/submitted?receipt=${encodeURIComponent(result.receiptChecksum)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize submission';
      error('Submission Error', msg);
      setIsSubmitting(false);
    }
  };

  /**
   * Auto submit when timer runs out
   */
  const handleTimeExpire = useCallback(() => {
    warning('Time Limit Reached', 'The allotted duration has elapsed. Auto-sealing your responses now...');
    handleConfirmSubmit();
  }, []);

  // Keyboard shortcut listener (1-4 or A-D to choose option, Arrows for next/prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or modal is open
      if (isSubmitModalOpen || isSubmitting) return;

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
  }, [currentIndex, exam, isSubmitModalOpen, isSubmitting, handleSelectOption]);

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

          {/* Center/Right: Live Sync Status, Timer, Submit */}
          <div className="flex items-center gap-3 sm:gap-4">
            <AutoSaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              latencyMs={latencyMs}
              lastChecksum={lastChecksum}
              errorMessage={saveErrorMsg}
            />

            <div className="w-36 sm:w-44">
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
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish &amp; Submit</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Switch Alert Banner (if any detected) */}
      {tabSwitchCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-300 text-amber-900 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 animate-fadeIn font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Proctoring Notice: <strong>{tabSwitchCount} window focus deviation(s)</strong> logged on your record. Stay on this screen.
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

            <button
              type="button"
              id="sidebar_submit_exam_btn"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Examination
            </button>
          </div>
        </aside>
      </main>

      {/* Final Submit Confirmation Modal */}
      <ConfirmSubmitModal
        isOpen={isSubmitModalOpen}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        isSubmitting={isSubmitting}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};
