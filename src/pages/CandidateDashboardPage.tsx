import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { Exam, ExamResult, ACADEMIC_LEVEL_MAP, AcademicLevel } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  Search,
  CheckCircle2,
  FileText,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';

export const CandidateDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { candidateUser, logoutCandidate } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExamIds, setCompletedExamIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [examsData, resultsData] = await Promise.all([
          apiClient.getExams(),
          apiClient.getResultsMe(candidateUser?.id),
        ]);
        
        // Active published exams
        setExams(examsData.filter((e) => e.status === 'published'));

        // Cross-reference completed exams
        const completedIds = new Set<string>();
        resultsData.forEach((res: ExamResult) => {
          completedIds.add(res.examId);
        });
        setCompletedExamIds(completedIds);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [candidateUser?.id]);

  const categories = ['ALL', ...Array.from(new Set(exams.map((e) => e.category)))];

  const filteredExams = exams.filter((e) => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Profile Welcome Card */}
        <div
          id="candidate_profile_card"
          className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {candidateUser?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Welcome, {candidateUser?.name || 'Candidate'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Candidate
                  </span>
                  {candidateUser?.level && (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-800" />
                      {ACADEMIC_LEVEL_MAP[candidateUser.level as AcademicLevel] || candidateUser.level}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1 font-mono">
                  <span>Matric No: <strong className="text-emerald-800 font-bold">{candidateUser?.regNumber || 'CBT/2026/CS/0492'}</strong></span>
                  <span>•</span>
                  <span>{candidateUser?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="dashboard_view_courses_btn"
                onClick={() => navigate('/courses')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition"
              >
                <BookOpen className="w-4 h-4 text-emerald-800" />
                <span>My Courses</span>
              </button>
              <button
                type="button"
                id="dashboard_view_results_btn"
                onClick={() => navigate('/results')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition"
              >
                <Award className="w-4 h-4 text-emerald-800" />
                <span>My Results</span>
              </button>
              <button
                type="button"
                id="dashboard_logout_btn"
                onClick={() => {
                  logoutCandidate();
                  navigate('/login');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 hover:border-rose-300 border border-stone-300 text-xs font-medium transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Section Header with Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              Available Examinations
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select an examination to begin or review completed submissions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="exam_search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course title or code..."
                className="w-full sm:w-64 bg-white border border-stone-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 shadow-xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        {isLoading ? (
          <LoadingSpinner label="Loading examination directory..." />
        ) : filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="candidate_exam_list">
            {filteredExams.map((exam) => {
              const isCompleted = completedExamIds.has(exam.id);

              return (
                <div
                  key={exam.id}
                  id={`exam_card_${exam.id}`}
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-sm group ${
                    isCompleted
                      ? 'border-stone-200 bg-stone-50/70'
                      : 'border-stone-200 hover:border-emerald-700 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300">
                        {exam.code}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-800" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded">
                          {exam.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors leading-snug">
                      {exam.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-5">
                      {exam.description}
                    </p>

                    {/* Metadata: Duration in minutes */}
                    <div className="grid grid-cols-2 gap-2 py-2.5 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">Duration</span>
                          <span className="font-mono font-bold text-stone-800">{exam.durationMinutes} minutes</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase font-bold">Pass mark</span>
                          <span className="font-mono font-bold text-emerald-900">{exam.passingScorePercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  {isCompleted ? (
                    <button
                      type="button"
                      id={`btn_view_result_${exam.id}`}
                      onClick={() => navigate('/results')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-emerald-900 border border-stone-300 text-xs font-bold transition shadow-xs"
                    >
                      <Award className="w-4 h-4 text-emerald-800" />
                      <span>Completed — View Results</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id={`btn_start_exam_${exam.id}`}
                      onClick={() => navigate(`/exam/${exam.id}/start`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs group-hover:shadow"
                    >
                      <span>Start Exam</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            id="exams_empty_state"
            className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No Examinations Found</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-5">
              No active examinations are currently published or matching your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

