import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { Course, ACADEMIC_LEVEL_MAP, AcademicLevel } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BookOpen,
  GraduationCap,
  ArrowRight,
  Search,
  BookMarked,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export const CandidateCoursesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { candidateUser } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiClient.getMyCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load my courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const userLevelDisplay = candidateUser?.level
    ? ACADEMIC_LEVEL_MAP[candidateUser.level as AcademicLevel] || candidateUser.level
    : 'Registered Level';

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div
          id="candidate_courses_header"
          className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    My Enrolled Courses
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Auto-Enrolled
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Enrolled under Academic Level:{' '}
                  <strong className="text-emerald-900 font-bold font-mono">{userLevelDisplay}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn_goto_available_exams"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Available Exams</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-800" />
              Course Curriculum
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              All courses linked to your level are automatically enrolled and available for examination
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="course_search_input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course title or code..."
              className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 shadow-xs"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <LoadingSpinner label="Loading your enrolled courses..." />
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="candidate_courses_list">
            {filteredCourses.map((course) => {
              const levelLabel = course.level
                ? ACADEMIC_LEVEL_MAP[course.level as AcademicLevel] || course.level
                : userLevelDisplay;

              return (
                <div
                  key={course.id}
                  id={`course_card_${course.id}`}
                  className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-700 hover:shadow-md transition group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-emerald-800" />
                        {levelLabel}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-6">
                      {course.description || 'Departmental computer-based curriculum course module.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> 2025/2026 Session
                    </span>
                    <button
                      type="button"
                      id={`btn_view_course_exams_${course.id}`}
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition"
                    >
                      <span>Take Exams</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            id="courses_empty_state"
            className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No Courses Enrolled</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              Courses for your academic level ({userLevelDisplay}) will appear here automatically once created by the department administrator.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold transition hover:bg-emerald-900 shadow-xs"
            >
              Go to Examination Dashboard
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
