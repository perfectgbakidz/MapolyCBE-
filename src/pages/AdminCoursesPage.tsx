import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { apiClient } from '../services/apiClient';
import { Course, AcademicLevel, ACADEMIC_LEVEL_MAP } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { CreateCourseModal } from '../components/admin/CreateCourseModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { success } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.getCourses();
      setCourses(data);
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    success(
      'Course Created',
      `Successfully created ${newCourse.code} for ${newCourse.level ? (ACADEMIC_LEVEL_MAP[newCourse.level as AcademicLevel] || newCourse.level) : 'level'}. Candidates have been auto-enrolled.`
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevelFilter === 'ALL' || c.level === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  const levelOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'ND1', label: 'ND 1' },
    { value: 'ND2', label: 'ND 2' },
    { value: 'HND1_SWD', label: 'HND 1 (SWD)' },
    { value: 'HND1_NCC', label: 'HND 1 (NCC)' },
    { value: 'HND2_SWD', label: 'HND 2 (SWD)' },
    { value: 'HND2_NCC', label: 'HND 2 (NCC)' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-800/20">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-emerald-800" />
              Academic Courses Management
            </h1>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Create curriculum courses tied to academic levels. Enrolled candidates automatically gain examination access.
            </p>
          </div>

          <button
            type="button"
            id="admin_btn_new_course"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Search & Level Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="admin_course_search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course code or title..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800"
              />
            </div>

            {/* Level Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {levelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedLevelFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedLevelFilter === opt.value
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-stone-600 font-mono font-medium whitespace-nowrap">
            Total Courses: <strong className="text-emerald-800 font-bold">{courses.length}</strong>
          </div>
        </div>

        {/* Courses Table / Cards */}
        {isLoading ? (
          <LoadingSpinner label="Loading course curriculum..." />
        ) : filteredCourses.length > 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden" id="admin_courses_table">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Course Code &amp; Title</th>
                    <th className="py-3.5 px-4">Academic Level</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Enrollment Model</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800 font-medium">
                  {filteredCourses.map((course) => {
                    const levelLabel = course.level
                      ? ACADEMIC_LEVEL_MAP[course.level as AcademicLevel] || course.level
                      : 'Unassigned';

                    return (
                      <tr key={course.id} className="hover:bg-stone-50 transition">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                              {course.code}
                            </span>
                          </div>
                          <span className="font-bold text-stone-900 text-sm block">{course.title}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold inline-flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {levelLabel}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs truncate text-stone-600">
                          {course.description || '—'}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200 inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-800" />
                            Auto-enrolled by Level
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/admin/exams')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-800 hover:text-white text-stone-800 text-xs font-bold border border-stone-200 transition"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Linked Exams</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            id="admin_courses_empty_state"
            className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No Courses Created</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              Create courses for ND1, ND2, HND1, or HND2 to enable auto-enrollment and examination assignment.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold transition hover:bg-emerald-900 shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Course</span>
            </button>
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      <Footer />
    </div>
  );
};
