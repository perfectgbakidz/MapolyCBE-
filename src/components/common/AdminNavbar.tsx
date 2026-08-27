import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import {
  ShieldAlert,
  LayoutDashboard,
  Layers,
  GraduationCap,
  Users,
  HelpCircle,
  Activity,
  LogOut,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { adminUser, logoutAdmin } = useAuth();
  const [criticalAlertCount, setCriticalAlertCount] = useState<number>(2);

  useEffect(() => {
    // Fetch count of high/critical alerts
    const checkAlerts = async () => {
      try {
        const stats = await apiClient.getAdminDashboardStats();
        setCriticalAlertCount(stats.securityAlertsTodayCount);
      } catch {
        // quiet fallback
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <nav
      id="admin_main_navbar"
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              id="admin_nav_brand_btn"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shadow-sm text-white group-hover:bg-emerald-900 transition-colors">
                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-stone-900 flex items-center gap-2">
                  MapolyCBE <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">ADMIN CONSOLE</span>
                </span>
                <p className="text-[11px] text-stone-500 font-medium">Moshood Abiola Polytechnic • CBE Admin &amp; Security</p>
              </div>
            </button>

            {/* Admin Nav items */}
            <div className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-stone-200">
              <button
                type="button"
                id="admin_nav_link_dashboard"
                onClick={() => navigate('/admin/dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  currentPath === '/admin/dashboard'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-800" />
                Dashboard
              </button>

              <button
                type="button"
                id="admin_nav_link_courses"
                onClick={() => navigate('/admin/courses')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  currentPath.startsWith('/admin/courses')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-800" />
                Courses
              </button>

              <button
                type="button"
                id="admin_nav_link_students"
                onClick={() => navigate('/admin/students')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  currentPath.startsWith('/admin/students')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-800" />
                Students
              </button>

              <button
                type="button"
                id="admin_nav_link_exams"
                onClick={() => navigate('/admin/exams')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  currentPath === '/admin/exams'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-800" />
                Manage Exams
              </button>

              <button
                type="button"
                id="admin_nav_link_questions"
                onClick={() => navigate('/admin/questions')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  currentPath.startsWith('/admin/questions') || currentPath.includes('/questions')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-800" />
                Exam Questions
              </button>

              <button
                type="button"
                id="admin_nav_link_security"
                onClick={() => navigate('/admin/security')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition relative ${
                  currentPath === '/admin/security'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Activity className="w-4 h-4 text-rose-600" />
                Security Monitoring
                {criticalAlertCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
                    {criticalAlertCount} ALERTS
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Switch to Candidate Area */}
            <button
              type="button"
              id="admin_nav_goto_candidate_portal"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition"
              title="Open Candidate Examination Portal"
            >
              <span>Candidate Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {/* Admin identity & logout */}
            {adminUser ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900">{adminUser.name}</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center justify-end gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-800" /> Root Admin
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {adminUser.name.charAt(0)}
                </div>
                <button
                  type="button"
                  id="admin_logout_btn"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                  title="Log out administrator"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
