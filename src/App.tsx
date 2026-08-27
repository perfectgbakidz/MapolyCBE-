import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CandidateRegisterPage } from './pages/CandidateRegisterPage';
import { CandidateLoginPage } from './pages/CandidateLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { CandidateCoursesPage } from './pages/CandidateCoursesPage';
import { ExamInstructionsPage } from './pages/ExamInstructionsPage';
import { TakeExamPage } from './pages/TakeExamPage';
import { ExamSubmittedPage } from './pages/ExamSubmittedPage';
import { MyResultsPage } from './pages/MyResultsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminManageExamsPage } from './pages/AdminManageExamsPage';
import { AdminManageQuestionsPage } from './pages/AdminManageQuestionsPage';
import { AdminQuestionBankPage } from './pages/AdminQuestionBankPage';
import { AdminSecurityMonitoringPage } from './pages/AdminSecurityMonitoringPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  const { currentPath, matchRoute } = useRouter();

  // 1. Landing
  if (currentPath === '/') {
    return <LandingPage />;
  }

  // 2. Candidate Registration
  if (currentPath === '/register') {
    return <CandidateRegisterPage />;
  }

  // 3. Candidate Login
  if (currentPath === '/login') {
    return <CandidateLoginPage />;
  }

  // 4. Admin Login
  if (currentPath === '/admin/login' || currentPath === '/admin/signin' || currentPath === '/admin-login') {
    return <AdminLoginPage />;
  }

  // 5. Candidate Dashboard
  if (currentPath === '/dashboard') {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <CandidateDashboardPage />
      </ProtectedRoute>
    );
  }

  // 5.1 Candidate Courses
  if (currentPath === '/courses') {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <CandidateCoursesPage />
      </ProtectedRoute>
    );
  }

  // 6. Exam Instructions
  if (matchRoute('/exam/:examId/start')) {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <ExamInstructionsPage />
      </ProtectedRoute>
    );
  }

  // 7. Take Exam (One question at a time with instant background persistence & countdown)
  if (matchRoute('/exam/:examId/take')) {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <TakeExamPage />
      </ProtectedRoute>
    );
  }

  // 8. Exam Submitted (Receipt & confirmation)
  if (matchRoute('/exam/:examId/submitted')) {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <ExamSubmittedPage />
      </ProtectedRoute>
    );
  }

  // 9. Candidate Results
  if (currentPath === '/results') {
    return (
      <ProtectedRoute role="candidate" redirectTo="/login">
        <MyResultsPage />
      </ProtectedRoute>
    );
  }

  // 10. Admin Dashboard
  if (currentPath === '/admin/dashboard' || currentPath === '/admin') {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminDashboardPage />
      </ProtectedRoute>
    );
  }

  // 10.1 Admin Courses Management
  if (currentPath === '/admin/courses') {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminCoursesPage />
      </ProtectedRoute>
    );
  }

  // 10.2 Admin Students Management & Candidate Results
  if (currentPath === '/admin/students') {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminStudentsPage />
      </ProtectedRoute>
    );
  }

  // 11. Admin Manage Exams
  if (currentPath === '/admin/exams') {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminManageExamsPage />
      </ProtectedRoute>
    );
  }

  // 12. Admin Manage Questions (by exam route)
  if (matchRoute('/admin/exams/:examId/questions')) {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminManageQuestionsPage />
      </ProtectedRoute>
    );
  }

  // 12.1 Admin Question Bank & Creator Hub
  if (currentPath === '/admin/questions' || matchRoute('/admin/questions/:examId')) {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminQuestionBankPage />
      </ProtectedRoute>
    );
  }

  // 13. Admin Security Monitoring & Tamper-Evidence
  if (currentPath === '/admin/security') {
    return (
      <ProtectedRoute role="admin" redirectTo="/admin/login">
        <AdminSecurityMonitoringPage />
      </ProtectedRoute>
    );
  }

  // 14. 404 Not Found
  return <NotFoundPage />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider>
            <AppRoutes />
          </RouterProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
