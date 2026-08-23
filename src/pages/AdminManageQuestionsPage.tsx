import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from '../context/RouterContext';
import { apiClient } from '../services/apiClient';
import { Exam, Question } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { AddQuestionModal } from '../components/admin/AddQuestionModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  HelpCircle,
  Plus,
  ChevronLeft,
  Trash2,
  Edit,
  CheckCircle2,
  Code2,
  AlertTriangle,
  Table as TableIcon,
  LayoutGrid,
  Check,
  AlertCircle,
} from 'lucide-react';

export const AdminManageQuestionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const params = useParams();
  const examId = params.examId;
  const { success, error } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Inline AddQuestionForm State
  const [formText, setFormText] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectOption, setFormCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formPoints, setFormPoints] = useState<number>(2);
  const [formCategory, setFormCategory] = useState('Core Architecture');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestionsAndExam = async () => {
    if (!examId) return;
    try {
      const [examData, adminQuestions] = await Promise.all([
        apiClient.getExamById(examId),
        apiClient.getExamQuestionsAdmin(examId),
      ]);
      setExam(examData);
      setQuestions(adminQuestions);
    } catch {
      error('Error', 'Failed to retrieve examination questions inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsAndExam();
  }, [examId]);

  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    // Client-side validation: all four options required and non-empty; correct_option must be one of A/B/C/D
    const trimmedText = formText.trim();
    if (!trimmedText) {
      setFormValidationError('Question text is required.');
      return;
    }

    const trimmedA = formOptionA.trim();
    const trimmedB = formOptionB.trim();
    const trimmedC = formOptionC.trim();
    const trimmedD = formOptionD.trim();

    if (!trimmedA || !trimmedB || !trimmedC || !trimmedD) {
      setFormValidationError('All four options (Option A, B, C, and D) are required and must not be empty.');
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(formCorrectOption)) {
      setFormValidationError('Correct option must be one of A, B, C, or D.');
      return;
    }

    if (!exam) return;

    setIsSubmitting(true);
    try {
      await apiClient.addQuestion(exam.id, {
        text: trimmedText,
        options: [
          { id: 'A', text: trimmedA },
          { id: 'B', text: trimmedB },
          { id: 'C', text: trimmedC },
          { id: 'D', text: trimmedD },
        ],
        correctOptionId: formCorrectOption,
        points: Number(formPoints) || 2,
        category: formCategory.trim() || exam.category,
        codeSnippet: showCodeInput && formCodeSnippet.trim() ? formCodeSnippet.trim() : undefined,
        explanation: formExplanation.trim() || undefined,
      });

      success('Question Added', `Question added with correct key: Option ${formCorrectOption}.`);

      // Reset form
      setFormText('');
      setFormOptionA('');
      setFormOptionB('');
      setFormOptionC('');
      setFormOptionD('');
      setFormCorrectOption('A');
      setFormPoints(2);
      setFormCodeSnippet('');
      setFormExplanation('');
      setShowCodeInput(false);
      setIsAddFormOpen(false);

      await fetchQuestionsAndExam();
    } catch (err: unknown) {
      setFormValidationError(err instanceof Error ? err.message : 'Failed to add question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!exam || !questionToDelete) return;
    try {
      await apiClient.deleteQuestion(exam.id, questionToDelete.id);
      success('Question Deleted', 'Removed question from the examination bank.');
      setQuestionToDelete(null);
      await fetchQuestionsAndExam();
    } catch {
      error('Delete Error', 'Failed to remove question.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-800/20">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <button
          type="button"
          onClick={() => navigate('/admin/exams')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-800" />
          <span>Back to Examinations List</span>
        </button>

        {isLoading || !exam ? (
          <LoadingSpinner label="Loading question bank..." />
        ) : (
          <>
            {/* Exam Title as Page Heading */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {exam.code}
                  </span>
                  <span className="text-xs text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200 font-semibold">
                    {exam.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 font-bold">
                    {questions.length} Questions in Bank
                  </span>
                </div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">{exam.title}</h1>
                <p className="text-xs text-stone-600 mt-1 max-w-2xl font-medium">{exam.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-stone-100 border border-stone-300 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      viewMode === 'table' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      viewMode === 'cards' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Detailed Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>

                <button
                  type="button"
                  id="toggle_add_question_form_btn"
                  onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    isAddFormOpen
                      ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  }`}
                >
                  <Plus className={`w-4 h-4 transition-transform ${isAddFormOpen ? 'rotate-45' : ''}`} />
                  <span>{isAddFormOpen ? 'Close Form' : 'Add New Question'}</span>
                </button>
              </div>
            </div>

            {/* AddQuestionForm Component */}
            {isAddFormOpen && (
              <div
                id="AddQuestionForm"
                className="bg-white border border-stone-300 rounded-2xl p-6 shadow-md animate-fadeIn text-stone-900"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-900">Add New Multiple-Choice Question</h3>
                      <p className="text-[11px] text-stone-600 font-medium">
                        Specify all four options and designate the verified correct answer option.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-300"
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-800" />
                    {showCodeInput ? 'Hide Code Snippet' : 'Attach Code Snippet'}
                  </button>
                </div>

                {formValidationError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formValidationError}</span>
                  </div>
                )}

                <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                  {/* Question Text (textarea) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Question Text (Prompt) <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="question_text_input"
                      rows={3}
                      required
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="e.g. Which CPU scheduling algorithm avoids indefinite starvation while guaranteeing maximum CPU utilization?"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-800 leading-relaxed font-medium"
                    />
                  </div>

                  {/* Optional Code Snippet */}
                  {showCodeInput && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-mono font-bold text-stone-700 mb-1">
                        Code / Query Snippet (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formCodeSnippet}
                        onChange={(e) => setFormCodeSnippet(e.target.value)}
                        placeholder="// Enter C, Java, Python, or SQL code block here..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Four Option Fields (A-D) and Correct Key Designation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-stone-800">
                        Four Option Statements (A–D) &amp; Correct Option Radio <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Select the radio button next to the correct answer.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'A' as const, val: formOptionA, setVal: setFormOptionA, label: 'Option A' },
                        { id: 'B' as const, val: formOptionB, setVal: setFormOptionB, label: 'Option B' },
                        { id: 'C' as const, val: formOptionC, setVal: setFormOptionC, label: 'Option C' },
                        { id: 'D' as const, val: formOptionD, setVal: setFormOptionD, label: 'Option D' },
                      ].map((opt) => {
                        const isCorrect = formCorrectOption === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                                : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer shrink-0">
                              <input
                                type="radio"
                                name="correct_option_radio"
                                id={`radio_correct_${opt.id}`}
                                checked={isCorrect}
                                onChange={() => setFormCorrectOption(opt.id)}
                                className="w-4 h-4 text-emerald-800 bg-white border-stone-300 focus:ring-emerald-800 cursor-pointer"
                              />
                              <span
                                className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center border ${
                                  isCorrect
                                    ? 'bg-emerald-800 text-white border-emerald-900'
                                    : 'bg-stone-200 text-stone-700 border-stone-300'
                                }`}
                              >
                                {opt.id}
                              </span>
                            </label>

                            <input
                              type="text"
                              required
                              id={`input_option_${opt.id}`}
                              value={opt.val}
                              onChange={(e) => opt.setVal(e.target.value)}
                              placeholder={`Enter ${opt.label} statement...`}
                              className="flex-1 bg-transparent text-xs text-stone-900 placeholder-stone-400 font-medium focus:outline-none"
                            />

                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Correct Option Dropdown + Points + Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Designated Correct Option
                      </label>
                      <select
                        id="select_correct_option"
                        value={formCorrectOption}
                        onChange={(e) => setFormCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-emerald-900 font-bold focus:outline-none focus:border-emerald-800"
                      >
                        <option value="A">Option A (Correct)</option>
                        <option value="B">Option B (Correct)</option>
                        <option value="C">Option C (Correct)</option>
                        <option value="D">Option D (Correct)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Points Weight (+Pts)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formPoints}
                        onChange={(e) => setFormPoints(Number(e.target.value))}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 font-bold focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        Topic / Category
                      </label>
                      <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="e.g. Memory, Cryptography"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Solution Explanation */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Solution Rationale / Explanation (Optional)
                    </label>
                    <input
                      type="text"
                      value={formExplanation}
                      onChange={(e) => setFormExplanation(e.target.value)}
                      placeholder="Rationale shown to candidates during post-exam review..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsAddFormOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn_submit_add_question"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'Saving Question...' : 'Add Question to Bank'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* QuestionTable Component */}
            {questions.length > 0 ? (
              viewMode === 'table' ? (
                <div
                  id="QuestionTable"
                  className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden"
                >
                  <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Question Bank Table</span>
                      <span className="text-[11px] text-stone-500 font-mono font-medium">
                        ({questions.length} total questions)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono font-bold">
                      Admin View: Correct Options Visibly Exposed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-3.5 w-12 text-center">#</th>
                          <th className="py-3 px-4 min-w-[280px]">Question Text</th>
                          <th className="py-3 px-3 min-w-[140px]">Option A</th>
                          <th className="py-3 px-3 min-w-[140px]">Option B</th>
                          <th className="py-3 px-3 min-w-[140px]">Option C</th>
                          <th className="py-3 px-3 min-w-[140px]">Option D</th>
                          <th className="py-3 px-4 min-w-[130px] text-center bg-emerald-50 text-emerald-950 border-x border-emerald-200">
                            Correct Option
                          </th>
                          <th className="py-3 px-3 text-center">Pts</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-800">
                        {questions.map((q, idx) => {
                          const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
                          const optA = q.options.find((o) => o.id === 'A')?.text || '';
                          const optB = q.options.find((o) => o.id === 'B')?.text || '';
                          const optC = q.options.find((o) => o.id === 'C')?.text || '';
                          const optD = q.options.find((o) => o.id === 'D')?.text || '';

                          return (
                            <tr key={q.id} className="hover:bg-stone-50 transition">
                              {/* Index */}
                              <td className="py-3.5 px-3.5 text-center font-mono font-bold text-stone-500">
                                {idx + 1}
                              </td>

                              {/* Question Text (Truncated) */}
                              <td className="py-3.5 px-4 font-semibold text-stone-900 max-w-xs">
                                <div className="line-clamp-2 leading-relaxed" title={q.text}>
                                  {q.text}
                                </div>
                                {q.codeSnippet && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                                    <Code2 className="w-2.5 h-2.5" /> Has Code Snippet
                                  </span>
                                )}
                              </td>

                              {/* Option A */}
                              <td
                                className={`py-3.5 px-3 text-xs truncate max-w-[150px] font-medium ${
                                  q.correctOptionId === 'A'
                                    ? 'text-emerald-900 font-bold bg-emerald-50'
                                    : 'text-stone-600'
                                }`}
                                title={optA}
                              >
                                <span className="font-mono font-bold text-stone-400 mr-1">A:</span>
                                {optA}
                              </td>

                              {/* Option B */}
                              <td
                                className={`py-3.5 px-3 text-xs truncate max-w-[150px] font-medium ${
                                  q.correctOptionId === 'B'
                                    ? 'text-emerald-900 font-bold bg-emerald-50'
                                    : 'text-stone-600'
                                }`}
                                title={optB}
                              >
                                <span className="font-mono font-bold text-stone-400 mr-1">B:</span>
                                {optB}
                              </td>

                              {/* Option C */}
                              <td
                                className={`py-3.5 px-3 text-xs truncate max-w-[150px] font-medium ${
                                  q.correctOptionId === 'C'
                                    ? 'text-emerald-900 font-bold bg-emerald-50'
                                    : 'text-stone-600'
                                }`}
                                title={optC}
                              >
                                <span className="font-mono font-bold text-stone-400 mr-1">C:</span>
                                {optC}
                              </td>

                              {/* Option D */}
                              <td
                                className={`py-3.5 px-3 text-xs truncate max-w-[150px] font-medium ${
                                  q.correctOptionId === 'D'
                                    ? 'text-emerald-900 font-bold bg-emerald-50'
                                    : 'text-stone-600'
                                }`}
                                title={optD}
                              >
                                <span className="font-mono font-bold text-stone-400 mr-1">D:</span>
                                {optD}
                              </td>

                              {/* Correct Option VISIBLY SHOWN IN ITS OWN COLUMN */}
                              <td className="py-3.5 px-4 text-center bg-emerald-50/60 border-x border-emerald-200">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                                  <span>Option {q.correctOptionId}</span>
                                </div>
                                {correctOpt && (
                                  <div
                                    className="text-[10px] text-emerald-950 font-semibold truncate max-w-[120px] mx-auto mt-0.5"
                                    title={correctOpt.text}
                                  >
                                    {correctOpt.text}
                                  </div>
                                )}
                              </td>

                              {/* Points */}
                              <td className="py-3.5 px-3 text-center font-mono font-bold text-stone-900">
                                +{q.points}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    id={`edit_question_btn_${q.id}`}
                                    onClick={() => {
                                      setEditingQuestion(q);
                                      setIsEditModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition border border-stone-200"
                                    title="Edit Question"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    id={`delete_question_btn_${q.id}`}
                                    onClick={() => setQuestionToDelete(q)}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 transition border border-stone-200 hover:border-rose-200"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
              ) : (
                /* Card View Mode */
                <div className="space-y-4" id="QuestionCardsList">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:border-stone-300 transition"
                    >
                      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-stone-100 text-emerald-900 font-mono text-xs font-bold flex items-center justify-center border border-stone-200">
                            {idx + 1}
                          </span>
                          {q.category && (
                            <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              {q.category}
                            </span>
                          )}
                          <span className="text-xs font-mono text-stone-800 font-bold">
                            +{q.points} Points
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-800" /> Key: Option {q.correctOptionId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestion(q);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition border border-stone-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionToDelete(q)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 transition border border-stone-200 hover:border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-stone-900 mb-3 leading-relaxed">
                        {q.text}
                      </p>

                      {q.codeSnippet && (
                        <div className="mb-4 p-3 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                          <pre>{q.codeSnippet}</pre>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correctOptionId;
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                  : 'bg-stone-50 border-stone-200 text-stone-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                  isCorrect
                                    ? 'bg-emerald-800 text-white'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-mono">
                          <strong className="text-stone-900">Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
                <HelpCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-900 mb-1">No Questions Added Yet</h3>
                <p className="text-xs text-stone-600 mb-6 font-medium">
                  Add multiple-choice questions with 4 options and designate the answer key.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
                >
                  Add First Question
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit Modal */}
      {exam && (
        <AddQuestionModal
          isOpen={isEditModalOpen}
          examId={exam.id}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingQuestion(null);
          }}
          onSave={async (qData) => {
            if (editingQuestion) {
              await apiClient.updateQuestion(exam.id, editingQuestion.id, qData);
              success('Question Updated', 'Changes saved successfully.');
              await fetchQuestionsAndExam();
            }
          }}
          initialQuestion={editingQuestion}
        />
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 shadow-xl text-stone-900 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-stone-900 mb-2">Delete Question?</h3>
            <p className="text-xs text-stone-600 text-center mb-6 leading-relaxed font-medium">
              Are you sure you want to remove this question from the examination bank?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn_confirm_delete_question"
                onClick={handleDeleteQuestion}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-xs"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
