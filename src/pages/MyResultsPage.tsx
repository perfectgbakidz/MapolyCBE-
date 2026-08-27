import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { ExamResult } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const MyResultsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { candidateUser } = useAuth();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!candidateUser) return;
      try {
        const data = await apiClient.getCandidateResults(candidateUser.id);
        setResults(data);
      } catch (e) {
        console.error('Failed to load candidate results:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [candidateUser]);

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <Award className="w-7 h-7 text-emerald-800" />
              Examination Results &amp; Transcripts
            </h1>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Cryptographically verified performance scorecards and question breakdowns
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Take More Exams</span>
          </button>
        </div>

        {/* Results List */}
        {isLoading ? (
          <LoadingSpinner label="Fetching certified transcripts & results..." />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="results_card_list">
            {results.map((res) => {
              const isPassed = res.passed;
              return (
                <div
                  key={res.id}
                  id={`result_card_${res.id}`}
                  className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-emerald-700 transition relative overflow-hidden"
                >
                  {/* Status Ribbon Glow */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                      isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}
                  />

                  <div>
                    {/* Header with Exam Code & Pass/Fail Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                        {res.examCode}
                      </span>

                      <div
                        id={`score_badge_${res.id}`}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{isPassed ? 'PASSED' : 'DID NOT PASS'}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 mb-2 leading-snug">
                      {res.examTitle}
                    </h3>

                    <p className="text-xs text-stone-500 font-mono mb-6">
                      Completed: {new Date(res.completedAt).toLocaleDateString()} at {new Date(res.completedAt).toLocaleTimeString()}
                    </p>

                    {/* Score Metric Panel */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 mb-6 text-center">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-0.5">
                          Final Score
                        </span>
                        <span
                          className={`font-mono text-2xl font-black ${
                            isPassed ? 'text-emerald-800' : 'text-rose-700'
                          }`}
                        >
                          {res.percentage}%
                        </span>
                      </div>

                      <div className="border-x border-stone-200">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-0.5">
                          Points Earned
                        </span>
                        <span className="font-mono text-base font-bold text-stone-800">
                          {res.score} / {res.totalScore}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-0.5">
                          Required Mark
                        </span>
                        <span className="font-mono text-base font-bold text-stone-600">
                          {res.passingScorePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Cryptographic Seal */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mb-4 px-1">
                      <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                        SHA-256 Verified
                      </span>
                      <span className="text-stone-400 truncate max-w-[180px]">{res.receiptChecksum}</span>
                    </div>
                  </div>

                  {/* Review Questions Button */}
                  <button
                    type="button"
                    id={`btn_review_answers_${res.id}`}
                    onClick={() => setSelectedResult(res)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition"
                  >
                    <Eye className="w-4 h-4 text-emerald-800" />
                    <span>Review Detailed Question Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            id="results_empty_state"
            className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No Exam Results Yet</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-6 font-medium">
              You haven&apos;t taken any examinations yet. Head over to the dashboard to begin an active session!
            </p>
            <button
              type="button"
              id="empty_state_goto_exams_btn"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
            >
              <span>Explore Available Examinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Detailed Question Review Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    {selectedResult.examCode}
                  </span>
                  <span className="text-xs text-stone-600 font-mono font-medium">
                    Score: {selectedResult.percentage}% ({selectedResult.score}/{selectedResult.totalScore} Pts)
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900">{selectedResult.examTitle}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="text-stone-400 hover:text-stone-800 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Breakdown List */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {selectedResult.breakdown.length > 0 ? (
                selectedResult.breakdown.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-5 rounded-2xl border ${
                      item.isCorrect
                        ? 'bg-white border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-rose-300 ring-1 ring-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-600">
                          {item.pointsEarned} / {item.totalPoints} Points
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.isCorrect
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{item.isCorrect ? 'Correct' : 'Incorrect'}</span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-stone-900 mb-4 leading-relaxed">
                      {item.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-3">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-stone-500 block text-[10px] font-bold uppercase">Your Answer:</span>
                        <span className={item.isCorrect ? 'text-emerald-900 font-bold' : 'text-rose-700 font-bold'}>
                          {item.selectedOptionId ? `Option ${item.selectedOptionId}` : 'Unanswered (0 Pts)'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-stone-500 block text-[10px] font-bold uppercase">Correct Answer:</span>
                        <span className="text-emerald-900 font-bold">Option {item.correctOptionId}</span>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                        <strong className="text-stone-900 font-bold block mb-0.5 font-mono text-[11px]">Explanation:</strong>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-500">
                  Detailed question review is sealed on this official certificate record.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-stone-200 bg-stone-50">
              <span className="text-xs font-mono text-stone-500 truncate max-w-sm">
                Receipt: {selectedResult.receiptChecksum}
              </span>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
