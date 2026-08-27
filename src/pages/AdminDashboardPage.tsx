import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { AdminDashboardStats, SecurityLogEvent } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  LayoutDashboard,
  Layers,
  Users,
  Award,
  ShieldAlert,
  Activity,
  Plus,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Radio,
  CheckCircle2,
  Clock,
  Fingerprint,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { adminUser } = useAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<SecurityLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        apiClient.getAdminDashboardStats(),
        apiClient.getSecurityLogs({ eventType: 'ALL' }),
      ]);
      setStats(statsData);
      setRecentLogs(logsData.slice(0, 8)); // Top 8 recent events
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000); // Polling telemetry
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
                <LayoutDashboard className="w-7 h-7 text-emerald-800" />
                Examination Security &amp; Controller Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-700 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Welcome, {adminUser?.name || 'Administrator'} • Central Examination Board &amp; Proctoring Layer
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="admin_dash_manage_students_btn"
              onClick={() => navigate('/admin/students')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs hover:scale-[1.01]"
            >
              <Users className="w-4 h-4" />
              <span>Manage Students &amp; Results</span>
            </button>
            <button
              type="button"
              id="admin_dash_add_questions_btn"
              onClick={() => navigate('/admin/questions')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 transition shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              <span>Exam Questions</span>
            </button>
            <button
              type="button"
              id="admin_dash_create_exam_btn"
              onClick={() => navigate('/admin/exams')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300 transition shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-800" />
              <span>Manage Exams</span>
            </button>
            <button
              type="button"
              id="admin_dash_audit_btn"
              onClick={() => navigate('/admin/security')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-emerald-900 text-xs font-bold border border-stone-300 transition shadow-xs"
            >
              <Fingerprint className="w-4 h-4 text-emerald-800" />
              <span>Integrity Audit</span>
            </button>
          </div>
        </div>

        {isLoading || !stats ? (
          <LoadingSpinner label="Loading live controller metrics..." />
        ) : (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" id="admin_stats_grid">
              {/* Stat 1: Active Exams */}
              <div id="stat_card_exams" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500">Published Examinations</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-3xl font-black text-stone-900 mb-1">
                  {stats.activeExamsCount}
                </div>
                <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Available to candidates now</span>
                </p>
              </div>

              {/* Stat 2: Registered Candidates */}
              <div
                id="stat_card_candidates"
                onClick={() => navigate('/admin/students')}
                className="bg-white border border-stone-200 hover:border-emerald-700 cursor-pointer rounded-2xl p-5 shadow-xs relative overflow-hidden transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500 group-hover:text-emerald-900 transition">Registered Candidates</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 group-hover:bg-emerald-100 border border-teal-300 flex items-center justify-center text-teal-800 group-hover:text-emerald-900 transition">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-3xl font-black text-stone-900 mb-1">
                  {stats.totalCandidatesCount}
                </div>
                <p className="text-[11px] text-teal-800 font-bold flex items-center gap-1 font-mono">
                  <span>Manage roster &amp; results &rarr;</span>
                </p>
              </div>

              {/* Stat 3: Completed Submissions */}
              <div id="stat_card_submissions" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500">Completed Submissions</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-3xl font-black text-stone-900 mb-1">
                  {stats.submissionsTodayCount}
                </div>
                <p className="text-[11px] text-stone-600 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-emerald-800" />
                  <span>Avg Score: <strong className="text-emerald-900 font-bold">{stats.averageScorePercentage}%</strong></span>
                </p>
              </div>

              {/* Stat 4: Security Alerts Today */}
              <div id="stat_card_alerts" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500">Security Alerts Today</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-800">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-3xl font-black text-rose-700 mb-1">
                  {stats.securityAlertsTodayCount}
                </div>
                <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-600" />
                  <span>Rate limits &amp; focus breaches</span>
                </p>
              </div>
            </div>

            {/* Layout Grid: Recent Activity Feed & Security Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left (8 cols): Recent Security & Exam Activity Feed */}
              <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs" id="recent_activity_feed">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-base font-bold text-stone-900">Live Telemetry &amp; Security Stream</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/security')}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 transition"
                  >
                    <span>View All Logs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentLogs.map((log) => {
                    const isCrit = log.severity === 'critical' || log.severity === 'high';
                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                          isCrit
                            ? 'bg-rose-50/70 border-rose-200 text-stone-900'
                            : log.severity === 'medium'
                            ? 'bg-amber-50/70 border-amber-200 text-stone-900'
                            : 'bg-stone-50 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 mt-0.5 border ${
                              isCrit
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : log.severity === 'medium'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {log.eventType}
                          </span>

                          <div>
                            <p className="font-semibold text-stone-900">{log.details}</p>
                            <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-stone-500 font-mono mt-1">
                              <span>IP: {log.sourceIp}</span>
                              {log.actorEmail && <span>Actor: {log.actorEmail}</span>}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-[11px] text-stone-500 shrink-0 self-end sm:self-auto font-medium">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right (4 cols): Quick Proctoring Summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 pb-2 border-b border-stone-200">
                    System Architecture Health
                  </h3>

                  <div className="space-y-3.5 text-xs font-mono">
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-sans">Background Sync Write:</span>
                      <span className="text-emerald-800 font-bold">Optimal (~90ms)</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-sans">HMAC Hash Algorithm:</span>
                      <span className="text-teal-800 font-bold">SHA-256</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-sans">Rate Limiting Shield:</span>
                      <span className="text-stone-900 font-bold">Token Bucket Active</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-sans">Anti-Cheating Monitor:</span>
                      <span className="text-emerald-800 font-bold">Engaged</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      id="btn_admin_full_security_hub"
                      onClick={() => navigate('/admin/security')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Open Live Security Monitor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
