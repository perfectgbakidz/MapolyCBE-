export type Role = 'candidate' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  regNumber?: string;
  phone?: string;
  department?: string;
  avatarUrl?: string;
  registeredAt: string;
  lastLoginAt: string;
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
