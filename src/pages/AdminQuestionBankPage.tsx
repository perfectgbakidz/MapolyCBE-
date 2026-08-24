import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { apiClient } from '../services/apiClient';
import { Exam, Question, ACADEMIC_LEVEL_MAP, AcademicLevel } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Code2,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AdminQuestionBankPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const routeExamId = params.examId;
  const { success, error, info } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(routeExamId || '');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Search & Filter
  const [examSearch, setExamSearch] = useState<string>('');
  const [questionSearch, setQuestionSearch] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // New Question Form state (matches POST /exams/{exam_id}/questions)
  const [text, setText] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [optionC, setOptionC] = useState<string>('');
  const [optionD, setOptionD] = useState<string>('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Load all exams initially
  const fetchAllExams = async () => {
    setIsLoadingExams(true);
    try {
      const data = await apiClient.getExams();
      setExams(data);
      if (data.length > 0) {
        if (routeExamId && data.some((e) => e.id === routeExamId)) {
          setSelectedExamId(routeExamId);
        } else if (!selectedExamId) {
          setSelectedExamId(data[0].id);
        }
      }
    } catch {
      error('Failed to load examinations', 'Could not fetch exams from backend.');
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchAllExams();
  }, []);

  // Fetch questions whenever selectedExamId changes
  useEffect(() => {
    if (!selectedExamId) {
      setSelectedExam(null);
      setQuestions([]);
      return;
    }

    const current = exams.find((e) => e.id === selectedExamId) || null;
    setSelectedExam(current);

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const [examData, qList] = await Promise.all([
          apiClient.getExamById(selectedExamId),
          apiClient.getExamQuestionsAdmin(selectedExamId),
        ]);
        setSelectedExam(examData);
        setQuestions(qList);
      } catch (err: any) {
        console.error('Failed to load questions:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [selectedExamId, exams]);

  // Filtered exams list for selector
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
        e.code.toLowerCase().includes(examSearch.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(examSearch.toLowerCase()));
      const matchesLevel =
        selectedLevelFilter === 'ALL' || (e.level && e.level === selectedLevelFilter);
      return matchesSearch && matchesLevel;
    });
  }, [exams, examSearch, selectedLevelFilter]);

  // Filtered questions for current exam
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const s = questionSearch.toLowerCase();
      return (
        q.text.toLowerCase().includes(s) ||
        q.options.some((opt) => opt.text.toLowerCase().includes(s))
      );
    });
  }, [questions, questionSearch]);

  const handleAddQuestionSubmit = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedExamId) {
      setFormError('Please select an examination first.');
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setFormError('Question prompt/statement is required.');
      return;
    }

    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();
    const trimmedC = optionC.trim();
    const trimmedD = optionD.trim();

    if (!trimmedA || !trimmedB || !trimmedC || !trimmedD) {
      setFormError('All four options (A, B, C, and D) are required and must not be blank.');
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
      setFormError('Correct option must be one of A, B, C, or D.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.addQuestion(selectedExamId, {
        text: trimmedText,
        options: [
          { id: 'A', text: trimmedA },
          { id: 'B', text: trimmedB },
          { id: 'C', text: trimmedC },
          { id: 'D', text: trimmedD },
        ],
        correctOptionId: correctOption,
        category: selectedExam?.category,
        codeSnippet: showCode && codeSnippet.trim() ? codeSnippet.trim() : undefined,
        explanation: explanation.trim() || undefined,
      });

      success(
        'Question Added Successfully',
        `Added to "${selectedExam?.title || 'Exam'}" with Correct Answer Option ${correctOption}.`
      );

      // Reset form fields
      setText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');
      setCodeSnippet('');
      setExplanation('');
      setShowCode(false);

      if (!keepOpen) {
        setIsAddModalOpen(false);
      } else {
        info('Ready for Next Question', 'Form cleared. You can enter the next question.');
      }

      // Refresh questions
      const qList = await apiClient.getExamQuestionsAdmin(selectedExamId);
      setQuestions(qList);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add question to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!selectedExamId) return;
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await apiClient.deleteQuestion(selectedExamId, qId);
      success('Question Deleted', 'Removed question from the bank.');
      const qList = await apiClient.getExamQuestionsAdmin(selectedExamId);
      setQuestions(qList);
    } catch {
      error('Deletion Error', 'Failed to remove question.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-800/20">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                ADMINISTRATION &amp; CURRICULUM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <HelpCircle className="w-8 h-8 text-emerald-800" />
              Examination Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
              Create, configure, and review multiple-choice questions for Moshood Abiola Polytechnic examinations with live API persistence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="admin_open_add_question_btn"
              disabled={!selectedExamId}
              onClick={() => {
                setFormError(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question to Current Exam</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/exams')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold transition shadow-xs"
            >
              <Layers className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Exams List</span>
            </button>
          </div>
        </div>

        {/* Exam Selection & Inventory Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (4 cols): Exam Selector list */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  Select Examination
                </h3>
                <span className="text-[11px] font-mono font-bold text-stone-500">
                  {exams.length} Exams
                </span>
              </div>

              {/* Search exams */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  placeholder="Filter exams..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Academic Level Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
                {['ALL', 'ND1', 'ND2', 'HND1_SWD', 'HND1_NCC', 'HND2_SWD', 'HND2_NCC'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevelFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                      selectedLevelFilter === lvl
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {lvl === 'ALL' ? 'All' : lvl.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Exams list */}
              {isLoadingExams ? (
                <div className="py-8 text-center text-xs text-stone-500">Loading exams...</div>
              ) : filteredExams.length > 0 ? (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredExams.map((exam) => {
                    const isSelected = exam.id === selectedExamId;
                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => setSelectedExamId(exam.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                              {exam.code}
                            </span>
                            {exam.level && (
                              <span className="text-[10px] text-emerald-800 font-semibold truncate">
                                {ACADEMIC_LEVEL_MAP[exam.level as AcademicLevel] || exam.level}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-stone-900 truncate">{exam.title}</p>
                          <span className="text-[11px] text-stone-500 mt-0.5 block font-medium">
                            {exam.durationMinutes} mins • {exam.category}
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected ? 'text-emerald-800 translate-x-1' : 'text-stone-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-stone-500">
                  No matching exams found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (8 cols): Selected Exam & Questions View / Add */}
          <div className="lg:col-span-8 space-y-6">
            {selectedExam ? (
              <>
                {/* Active Exam Header Banner */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                        {selectedExam.code}
                      </span>
                      <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200">
                        {selectedExam.level ? (ACADEMIC_LEVEL_MAP[selectedExam.level as AcademicLevel] || selectedExam.level) : selectedExam.category}
                      </span>
                      <span className="text-xs font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 font-bold">
                        {questions.length} Questions Configured
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-stone-900">{selectedExam.title}</h2>
                    <p className="text-xs text-stone-600 mt-1 max-w-xl font-medium">
                      {selectedExam.description || 'Candidates will be served these questions in random or sequential order.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Question</span>
                  </button>
                </div>

                {/* Questions List & Filter */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        placeholder="Search questions by prompt or options..."
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <div className="text-xs text-stone-600 font-mono font-medium">
                      Showing <strong className="text-emerald-800 font-bold">{filteredQuestions.length}</strong> of{' '}
                      <strong>{questions.length}</strong> questions
                    </div>
                  </div>

                  {isLoadingQuestions ? (
                    <LoadingSpinner label="Fetching question inventory from backend..." />
                  ) : filteredQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition text-stone-900"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-start gap-3">
                              <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-stone-900 leading-relaxed">
                                  {q.text}
                                </p>
                                {q.codeSnippet && (
                                  <pre className="mt-2.5 p-3 rounded-xl bg-stone-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-stone-800">
                                    <code>{q.codeSnippet}</code>
                                  </pre>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-stone-200/80">
                            {q.options.map((opt) => {
                              const isCorrect = q.correctOptionId === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border flex items-center gap-3 text-xs transition ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                      : 'bg-white border-stone-200 text-stone-700 font-medium'
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-800 text-white'
                                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                                    }`}
                                  >
                                    {opt.id}
                                  </span>
                                  <span className="flex-1">{opt.text}</span>
                                  {isCorrect && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1 shrink-0">
                                      <Check className="w-3 h-3 text-emerald-800 stroke-[3]" />
                                      CORRECT
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-300 p-8">
                      <HelpCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-stone-900 mb-1">
                        No Questions in This Examination Bank Yet
                      </h4>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mb-5">
                        Add standard 4-option multiple-choice questions with verified correct answer keys to enable candidates to take this exam.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setIsAddModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Question</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs">
                <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-900 mb-1">No Examination Selected</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Select an examination from the left panel or create an exam first to start building its question bank.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Add Question to {selectedExam?.code}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {selectedExam?.title} • Designated Correct Key will be verified automatically
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form
              onSubmit={(e) => handleAddQuestionSubmit(e, false)}
              className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Question Text */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    Question Prompt / Statement <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {showCode ? 'Remove Code Snippet' : 'Attach Code Snippet'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Which layer of the OSI reference model is responsible for packet forwarding, routing, and IP addressing?"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-800 font-medium leading-relaxed"
                />
              </div>

              {/* Optional Code Snippet */}
              {showCode && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                    Code / Query Block (Monospace)
                  </label>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="public class Example { ... }"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Four Options: A, B, C, D */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-800">
                  Multiple-Choice Options &amp; Correct Answer Key <span className="text-rose-600">*</span>
                </label>
                <p className="text-[11px] text-stone-500 -mt-1 font-medium">
                  Fill in all 4 choices and select which option is the correct key.
                </p>

                {/* Option A */}
                <div className={`p-3 rounded-xl border transition ${correctOption === 'A' ? 'bg-emerald-50/70 border-emerald-400' : 'bg-stone-50 border-stone-300'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectOption('A')}
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition ${
                        correctOption === 'A'
                          ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      A
                    </button>
                    <input
                      type="text"
                      required
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="Option A answer text..."
                      className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                    />
                    <label
                      onClick={() => setCorrectOption('A')}
                      className="cursor-pointer text-[11px] font-bold text-stone-700 flex items-center gap-1.5 select-none"
                    >
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={correctOption === 'A'}
                        onChange={() => setCorrectOption('A')}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                </div>

                {/* Option B */}
                <div className={`p-3 rounded-xl border transition ${correctOption === 'B' ? 'bg-emerald-50/70 border-emerald-400' : 'bg-stone-50 border-stone-300'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectOption('B')}
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition ${
                        correctOption === 'B'
                          ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      B
                    </button>
                    <input
                      type="text"
                      required
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="Option B answer text..."
                      className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                    />
                    <label
                      onClick={() => setCorrectOption('B')}
                      className="cursor-pointer text-[11px] font-bold text-stone-700 flex items-center gap-1.5 select-none"
                    >
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={correctOption === 'B'}
                        onChange={() => setCorrectOption('B')}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                </div>

                {/* Option C */}
                <div className={`p-3 rounded-xl border transition ${correctOption === 'C' ? 'bg-emerald-50/70 border-emerald-400' : 'bg-stone-50 border-stone-300'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectOption('C')}
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition ${
                        correctOption === 'C'
                          ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      C
                    </button>
                    <input
                      type="text"
                      required
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="Option C answer text..."
                      className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                    />
                    <label
                      onClick={() => setCorrectOption('C')}
                      className="cursor-pointer text-[11px] font-bold text-stone-700 flex items-center gap-1.5 select-none"
                    >
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={correctOption === 'C'}
                        onChange={() => setCorrectOption('C')}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                </div>

                {/* Option D */}
                <div className={`p-3 rounded-xl border transition ${correctOption === 'D' ? 'bg-emerald-50/70 border-emerald-400' : 'bg-stone-50 border-stone-300'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectOption('D')}
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition ${
                        correctOption === 'D'
                          ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      D
                    </button>
                    <input
                      type="text"
                      required
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="Option D answer text..."
                      className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                    />
                    <label
                      onClick={() => setCorrectOption('D')}
                      className="cursor-pointer text-[11px] font-bold text-stone-700 flex items-center gap-1.5 select-none"
                    >
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={correctOption === 'D'}
                        onChange={() => setCorrectOption('D')}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleAddQuestionSubmit(e, true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Add Next Question'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
