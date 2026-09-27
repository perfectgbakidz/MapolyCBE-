import React, { useState, useEffect } from 'react';
import { Exam, ExamStatus, Course, ACADEMIC_LEVEL_MAP, AcademicLevel } from '../../types';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { X, Plus, Trash2, Layers, AlertCircle, BookOpen, Loader2 } from 'lucide-react';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (examData: Partial<Exam>) => Promise<void>;
  onExamCreated?: () => void;
  initialExam?: Exam | null;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onExamCreated,
  initialExam,
}) => {
  const { success, error } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isCreatingQuickCourse, setIsCreatingQuickCourse] = useState(false);
  const [courseId, setCourseId] = useState('');

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [passingScorePercent, setPassingScorePercent] = useState<number>(70);
  const [status, setStatus] = useState<ExamStatus>('published');
  const [showResultsImmediately, setShowResultsImmediately] = useState<boolean>(true);
  const [instructions, setInstructions] = useState<string[]>([
    'Read each question carefully before choosing your option.',
    'Real-time background autosave is active on every click.',
    'Do not navigate away from the test window.',
  ]);
  const [newInstruction, setNewInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load courses
  useEffect(() => {
    if (!isOpen) return;

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const fetched = await apiClient.getCourses();
        setCourses(fetched);
        if (fetched.length > 0 && !courseId && !initialExam) {
          handleCourseChangeWithList(fetched[0].id, fetched);
        }
      } catch (e) {
        console.error('Failed to load courses for exam creation modal:', e);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [isOpen]);

  useEffect(() => {
    if (initialExam) {
      setTitle(initialExam.title || '');
      setCode(initialExam.code || '');
      setCourseId(initialExam.course_id || initialExam.courseId || '');
      setCategory(initialExam.category || 'Computer Science');
      setDescription(initialExam.description || '');
      setDurationMinutes(initialExam.durationMinutes || 45);
      setPassingScorePercent(initialExam.passingScorePercent || 70);
      setStatus(initialExam.status || 'published');
      setShowResultsImmediately(initialExam.showResultsImmediately ?? true);
      setInstructions(
        initialExam.instructions && initialExam.instructions.length > 0
          ? initialExam.instructions
          : [
              'Read each question carefully before choosing your option.',
              'Real-time background autosave is active on every click.',
              'Do not navigate away from the test window.',
            ]
      );
    } else {
      setTitle('');
      setCode(`EX-${Math.floor(100 + Math.random() * 900)}-2026`);
      setCourseId('');
      setCategory('Computer Science');
      setDescription('');
      setDurationMinutes(45);
      setPassingScorePercent(70);
      setStatus('published');
      setShowResultsImmediately(true);
      setInstructions([
        'Read each question carefully before choosing your option.',
        'Real-time background autosave is active on every click.',
        'Do not navigate away from the test window.',
      ]);
    }
    setValidationError(null);
  }, [initialExam, isOpen]);

  const handleCourseChangeWithList = (selectedId: string, list: Course[]) => {
    setCourseId(selectedId);
    const selectedCourse = list.find((c) => c.id === selectedId);
    if (selectedCourse) {
      if (!title || title.startsWith('EX-') || title === '') {
        setTitle(`${selectedCourse.code}: ${selectedCourse.title} Examination`);
      }
      if (!code || code.startsWith('EX-')) {
        setCode(selectedCourse.code);
      }
    }
  };

  const handleCourseChange = (selectedId: string) => {
    handleCourseChangeWithList(selectedId, courses);
  };

  const handleQuickCreateCourse = async () => {
    setIsCreatingQuickCourse(true);
    setValidationError(null);
    try {
      const created = await apiClient.createCourse({
        name: 'Introduction to Computing',
        title: 'Introduction to Computing',
        code: 'COM111',
        level: 'ND1',
        description: 'Foundational computer science principles, hardware, and algorithms.',
      });
      const updatedCourses = [...courses, created];
      setCourses(updatedCourses);
      handleCourseChangeWithList(created.id, updatedCourses);
      success('Course Created', 'COM111 (Introduction to Computing) created and selected.');
    } catch (e: any) {
      const msg = e?.message || 'Failed to auto-create COM111 course';
      setValidationError(msg);
      error('Course Creation Failed', msg);
    } finally {
      setIsCreatingQuickCourse(false);
    }
  };

  if (!isOpen) return null;

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (idx: number) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!courseId) {
      setValidationError('Please select the Course this examination belongs to.');
      return;
    }

    // Validation (mirrors backend rules)
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      setValidationError('Examination title must be between 3 and 200 characters.');
      return;
    }

    const dur = Number(durationMinutes);
    if (isNaN(dur) || dur < 1 || dur > 600) {
      setValidationError('Duration must be between 1 and 600 minutes.');
      return;
    }

    if (!code.trim()) {
      setValidationError('Exam/Course code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Exam> & { course_id?: string; courseId?: string } = {
        title: trimmedTitle,
        code: code.trim().toUpperCase(),
        course_id: courseId,
        courseId: courseId,
        category,
        description: description.trim() || 'Comprehensive Computer-Based Examination evaluation.',
        durationMinutes: dur,
        passingScorePercent: Number(passingScorePercent) || 70,
        status,
        showResultsImmediately,
        instructions: instructions.length > 0 ? instructions : ['Answer all questions carefully.'],
      };

      if (onSave) {
        await onSave(payload);
      } else {
        if (initialExam) {
          await apiClient.updateExam(initialExam.id, payload);
          success('Examination Updated', `"${payload.title}" (${payload.code}) was updated successfully.`);
        } else {
          const created = await apiClient.createExam(payload as any);
          success('Examination Created', `"${created.title}" (${created.code}) created successfully.`);
        }
        if (onExamCreated) {
          onExamCreated();
        }
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Failed to save examination.');
      setValidationError(msg);
      error('Creation Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {initialExam ? 'Edit Examination' : 'Create New Examination'}
              </h3>
              <p className="text-xs text-stone-600 font-medium">Link exam to a Course and configure examination parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Course Selection (Required) */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center justify-between">
              <span>Associated Course (Determines Candidate Level Access) *</span>
              {isLoadingCourses && (
                <span className="text-[11px] text-stone-500 flex items-center gap-1 font-normal">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading courses...
                </span>
              )}
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="exam_course_select"
                required
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              >
                <option value="">Select the associated Course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    [{course.level ? (ACADEMIC_LEVEL_MAP[course.level as AcademicLevel] || course.level) : 'General'}] {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </div>
            {courses.length === 0 && !isLoadingCourses && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
                <span>No courses found on server yet.</span>
                <button
                  type="button"
                  disabled={isCreatingQuickCourse}
                  onClick={handleQuickCreateCourse}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isCreatingQuickCourse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating COM111...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Quick Create COM111 (ND1) Course</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Examination Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CSC 401: Advanced Operating Systems"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Course / Exam Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CSC-401-2026"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono uppercase focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Department / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Networking">Networking</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Engineering & Ethics">Engineering &amp; Ethics</option>
                <option value="General Studies">General Studies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Pass Mark (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={passingScorePercent}
                onChange={(e) => setPassingScorePercent(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of exam scope and evaluation topics..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExamStatus)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800"
              >
                <option value="published">Published (Live for Candidates)</option>
                <option value="draft">Draft (Admin editing only)</option>
                <option value="archived">Archived (Closed)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="show_res_immediate"
                checked={showResultsImmediately}
                onChange={(e) => setShowResultsImmediately(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 bg-stone-50 text-emerald-800 focus:ring-emerald-800"
              />
              <label htmlFor="show_res_immediate" className="text-xs font-medium text-stone-700 cursor-pointer">
                Release instant graded results upon submission
              </label>
            </div>
          </div>

          {/* Instructions List */}
          <div className="pt-3 border-t border-stone-200">
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Candidate Instructions
            </label>
            <div className="space-y-2 mb-3">
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs text-stone-800 font-medium">
                  <span className="font-mono text-emerald-800 font-bold">{idx + 1}.</span>
                  <span className="flex-1">{inst}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="Add rule or instruction..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInstruction();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Saving Examination...' : initialExam ? 'Save Changes' : 'Create Examination'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
