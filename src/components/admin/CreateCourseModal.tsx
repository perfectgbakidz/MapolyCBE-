import React, { useState } from 'react';
import { Course, AcademicLevel, ACADEMIC_LEVEL_MAP } from '../../types';
import { apiClient } from '../../services/apiClient';
import { X, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<AcademicLevel | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = code.trim().toUpperCase();
    const trimmedTitle = title.trim();

    if (!trimmedCode) {
      setErrorMsg('Course code is required (e.g., CSC 101).');
      return;
    }
    if (!trimmedTitle) {
      setErrorMsg('Course title is required.');
      return;
    }
    if (!level) {
      setErrorMsg('Academic level must be selected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiClient.createCourse({
        code: trimmedCode,
        title: trimmedTitle,
        level: level as AcademicLevel,
        description: description.trim(),
      });
      onCourseCreated(created);
      onClose();
      // Reset form
      setCode('');
      setTitle('');
      setLevel('');
      setDescription('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Create New Course</h3>
              <p className="text-xs text-stone-600 font-medium">
                Enrolls all candidates at the selected academic level automatically
              </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Course Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSC 201"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono uppercase focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures and Algorithms"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Academic Level *
            </label>
            <select
              required
              value={level}
              onChange={(e) => setLevel(e.target.value as AcademicLevel)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
            >
              <option value="">Select target academic level...</option>
              <optgroup label="National Diploma (ND)">
                <option value="ND1">ND 1</option>
                <option value="ND2">ND 2</option>
              </optgroup>
              <optgroup label="Higher National Diploma (HND)">
                <option value="HND1_SWD">HND 1 — Software Engineering</option>
                <option value="HND1_NCC">HND 1 — Network &amp; Computer Connectivity</option>
                <option value="HND2_SWD">HND 2 — Software Engineering</option>
                <option value="HND2_NCC">HND 2 — Network &amp; Computer Connectivity</option>
              </optgroup>
            </select>
            <p className="text-[11px] text-stone-500 mt-1 font-normal">
              All registered candidates currently at this level will be enrolled automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course overview, curriculum topics, departmental notes..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Course</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
