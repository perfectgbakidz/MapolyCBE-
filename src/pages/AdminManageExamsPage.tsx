import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { apiClient } from '../services/apiClient';
import { Exam } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { CreateExamModal } from '../components/admin/CreateExamModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Plus,
  HelpCircle,
  Clock,
  Award,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const AdminManageExamsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { success, error } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  const fetchExams = async () => {
    try {
      const data = await apiClient.getExams();
      setExams(data);
    } catch (e) {
      console.error('Failed to load exams:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleToggleStatus = async (exam: Exam) => {
    const newStatus = exam.status === 'published' ? 'draft' : 'published';
    try {
      await apiClient.updateExam(exam.id, { status: newStatus });
      success(
        'Exam Status Updated',
        `${exam.code} is now ${newStatus === 'published' ? 'published and accessible to candidates.' : 'set to draft.'}`
      );
      fetchExams();
    } catch {
      error('Update Failed', 'Failed to change examination status.');
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      await apiClient.deleteExam(examToDelete.id);
      success('Exam Deleted', `Removed examination ${examToDelete.code} from the system.`);
      setExamToDelete(null);
      fetchExams();
    } catch {
      error('Deletion Error', 'Could not delete examination.');
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-800/20">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-emerald-800" />
              Examination Management
            </h1>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Configure question banks, timing rules, pass benchmarks, and publishing states
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="admin_btn_question_bank"
              onClick={() => navigate('/admin/questions')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold transition shadow-xs hover:scale-[1.01]"
            >
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              <span>Questions Bank</span>
            </button>

            <button
              type="button"
              id="admin_btn_new_exam"
              onClick={() => {
                setEditingExam(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Examination</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="admin_exam_search_input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, title, or category..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800"
            />
          </div>

          <div className="text-xs text-stone-600 font-mono font-medium">
            Total Configured: <strong className="text-emerald-800 font-bold">{exams.length} Exams</strong>
          </div>
        </div>

        {/* Exam Table */}
        {isLoading ? (
          <LoadingSpinner label="Loading examination records..." />
        ) : filteredExams.length > 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden" id="admin_exam_table">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Course &amp; Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Duration</th>
                    <th className="py-3.5 px-4 text-center">Questions</th>
                    <th className="py-3.5 px-4 text-center">Pass Benchmark</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800 font-medium">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-stone-50 transition">
                      {/* Title & Code */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {exam.code}
                          </span>
                        </div>
                        <span className="font-bold text-stone-900 text-sm block">{exam.title}</span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold">
                          {exam.category}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className="text-stone-800 font-bold">{exam.durationMinutes} min</span>
                      </td>

                      {/* Questions Count */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-900 border border-stone-300 font-bold">
                          {exam.questions?.length || exam.totalQuestions} Qs
                        </span>
                      </td>

                      {/* Pass Benchmark */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className="text-emerald-800 font-bold">{exam.passingScorePercent}%</span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          id={`btn_toggle_status_${exam.id}`}
                          onClick={() => handleToggleStatus(exam)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                            exam.status === 'published'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {exam.status === 'published' ? '● Published' : '○ Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            id={`btn_manage_questions_${exam.id}`}
                            onClick={() => navigate(`/admin/questions`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-800 text-emerald-900 hover:text-white transition border border-emerald-300 text-xs font-bold"
                            title="Manage & Add Questions"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Questions</span>
                          </button>

                          <button
                            type="button"
                            id={`btn_edit_exam_${exam.id}`}
                            onClick={() => {
                              setEditingExam(exam);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition border border-stone-200"
                            title="Edit Exam Settings"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            id={`btn_delete_exam_${exam.id}`}
                            onClick={() => setExamToDelete(exam)}
                            className="p-2 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 transition border border-stone-200 hover:border-rose-200"
                            title="Delete Examination"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <Layers className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900 mb-1">No Examinations Found</h3>
            <p className="text-xs text-stone-600 mb-6 font-medium">Create a new examination to begin authoring questions.</p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
            >
              Create Examination
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Exam Modal */}
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingExam(null);
        }}
        onExamCreated={fetchExams}
        initialExam={editingExam}
      />

      {/* Delete Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 shadow-xl text-stone-900 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-700 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-stone-900 mb-2">Delete Examination?</h3>
            <p className="text-xs text-stone-600 text-center mb-6 leading-relaxed font-medium">
              Are you sure you want to permanently delete <strong className="text-stone-900 font-bold">{examToDelete.title} ({examToDelete.code})</strong>? All questions and records associated will be removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn_confirm_delete_exam"
                onClick={handleDeleteExam}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-xs"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
