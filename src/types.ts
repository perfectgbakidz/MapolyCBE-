export type Role = 'candidate' | 'admin' | 'parent';

export type AcademicLevel = 'ND1' | 'ND2' | 'HND1_SWD' | 'HND1_NCC' | 'HND2_SWD' | 'HND2_NCC';

// ==========================================
// PARENT / GUARDIAN PORTAL TYPES
// ==========================================
export interface ParentUser {
  id: string;
  full_name: string;
  phone_number: string;
  address?: string;
  role: 'parent';
  children?: ChildMatch[];
}

export interface ChildMatch {
  name_submitted: string;
  matched: boolean;
  candidate_id: string | null;
  matric_no: string | null;
}

export interface ParentRegisterPayload {
  full_name: string;
  address: string;
  phone_number: string;
  password: string;
  children_names: string[];
}

export interface ParentRegisterResponse {
  access_token: string;
  token_type: string;
  role: string;
  children: ChildMatch[];
}

export interface ChildSummary {
  id: string;
  matric_no: string;
  full_name: string;
  level: AcademicLevel;
}

export interface ChildExamStatus {
  exam_id: string;
  title: string;
  course_id: string;
  level: AcademicLevel;
  duration_minutes: number;
  is_active: boolean;
  done: boolean;
  result: {
    id: string;
    exam_id: string;
    score: number;
    total_questions: number;
    submitted_at: string;
    checksum: string;
  } | null;
}

export interface ChildResultWithExam {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  submitted_at: string;
  checksum: string;
  exam_title: string;
}

export const ACADEMIC_LEVELS: { value: AcademicLevel; label: string; group: 'ND' | 'HND' }[] = [
  { value: 'ND1', label: 'ND 1', group: 'ND' },
  { value: 'ND2', label: 'ND 2', group: 'ND' },
  { value: 'HND1_SWD', label: 'HND 1 — Software & Web Development', group: 'HND' },
  { value: 'HND1_NCC', label: 'HND 1 — Networking & Cloud Computing', group: 'HND' },
  { value: 'HND2_SWD', label: 'HND 2 — Software & Web Development', group: 'HND' },
  { value: 'HND2_NCC', label: 'HND 2 — Networking & Cloud Computing', group: 'HND' },
];

export const ACADEMIC_LEVEL_MAP: Record<AcademicLevel, string> = {
  ND1: 'ND 1',
  ND2: 'ND 2',
  HND1_SWD: 'HND 1 — Software & Web Development',
  HND1_NCC: 'HND 1 — Networking & Cloud Computing',
  HND2_SWD: 'HND 2 — Software & Web Development',
  HND2_NCC: 'HND 2 — Networking & Cloud Computing',
};

export interface Course {
  id: string;
  name?: string;
  title?: string;
  code: string;
  level: AcademicLevel;
  description?: string;
  created_at?: string;
  createdAt?: string;
  enrolled_candidates?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  regNumber?: string;
  level?: AcademicLevel;
  phone?: string;
  department?: string;
  avatarUrl?: string;
  registeredAt: string;
  lastLoginAt: string;
}

export interface CandidateAdminView {
  id: string;
  matric_no: string;
  email: string;
  full_name: string;
  level: AcademicLevel;
  is_active: boolean;
  is_locked: boolean;
  failed_login_attempts: number;
  created_at: string;
}

export interface CandidateAdminDetail extends CandidateAdminView {
  enrolled_courses: Course[];
}

export interface CandidateUpdate {
  full_name?: string;
  email?: string;
  level?: AcademicLevel;
}

export interface StudentResultWithExam {
  id: string;
  exam_id: string;
  exam_title: string;
  score: number;
  total_questions: number;
  submitted_at: string;
  checksum: string;
}

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  examId: string;
  questionNumber: number;
  text: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctOptionId: string; // 'A' | 'B' | 'C' | 'D'
  points: number;
  explanation?: string;
  category?: string;
}

export type ExamStatus = 'published' | 'draft' | 'archived';

export interface Exam {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScorePercent: number;
  status: ExamStatus;
  courseId?: string;
  course_id?: string;
  level?: AcademicLevel;
  instructions: string[];
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultsImmediately: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  markedForReview: boolean;
  answeredAt: string;
  timeSpentSeconds: number;
  checksum: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  syncLatencyMs?: number;
}

export interface ExamSession {
  sessionId: string;
  examId: string;
  candidateId: string;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  answers: Record<string, AnswerRecord>;
  tabSwitchCount: number;
  isSubmitted: boolean;
  submittedAt?: string;
  submissionReceiptId?: string;
  submissionChecksum?: string;
}

export interface QuestionResultBreakdown {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalPoints: number;
  explanation?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examCode: string;
  candidateId: string;
  candidateName: string;
  candidateRegNumber: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  passingScorePercent: number;
  startedAt: string;
  completedAt: string;
  timeTakenSeconds: number;
  tabSwitchCount: number;
  receiptChecksum: string;
  integrityVerified: boolean;
  breakdown: QuestionResultBreakdown[];
}

export interface PasswordResetRequest {
  id: string;
  matricNo: string;
  email: string;
  fullName?: string;
  reason?: string;
  status: 'pending' | 'resolved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedByAdminId?: string;
  adminNotes?: string;
  temporaryPasswordAssigned?: string;
}

export interface StudentPasswordRecord {
  matricNo: string;
  email?: string;
  candidateId?: string;
  fullName?: string;
  level?: AcademicLevel;
  currentPassword: string;
  initialBackendPassword?: string;
  updatedAt: string;
  updatedBy: 'admin' | 'student' | 'registration';
  adminId?: string;
  adminNotes?: string;
}

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_TRIGGERED'
  | 'CHECKSUM_MISMATCH'
  | 'INTEGRITY_TAMPER_ATTEMPT'
  | 'TAB_SWITCH_SUSPECT'
  | 'RAPID_ANSWER_BURST'
  | 'EXAM_TIME_EXPIRED_SUBMIT'
  | 'ADMIN_CONFIG_CHANGE'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT';

export interface SecurityLogEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  sourceIp: string;
  userAgent: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: Role | 'anonymous';
  examId?: string;
  endpoint?: string;
  details: string;
  payloadChecksum?: string;
  resolved: boolean;
}

export interface SingleIntegrityVerification {
  id: string;
  targetType: 'response' | 'result';
  intact: boolean;
  expectedChecksum: string;
  computedChecksum: string;
  verifiedAt: string;
  details: string;
  metadata?: {
    candidateName?: string;
    score?: number;
    examTitle?: string;
    questionId?: string;
    selectedOption?: string;
  };
}

export interface IntegrityCheckResult {
  examId: string;
  examTitle: string;
  totalSubmissionsChecked: number;
  tamperedCount: number;
  verifiedCount: number;
  status: 'passed' | 'failed' | 'warning';
  checksumAlgorithm: 'SHA-256 (HMAC-backed)';
  lastAuditTimestamp: string;
  anomalies: {
    submissionId: string;
    candidateName: string;
    expectedHash: string;
    computedHash: string;
    reason: string;
  }[];
}

export interface AdminDashboardStats {
  activeExamsCount: number;
  totalCandidatesCount: number;
  submissionsTodayCount: number;
  securityAlertsTodayCount: number;
  averageScorePercentage: number;
  activeLiveExamsNow: number;
}
