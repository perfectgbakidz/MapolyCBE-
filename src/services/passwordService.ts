import { StudentPasswordRecord, PasswordResetRequest, AcademicLevel } from '../types';

const STUDENT_PASSWORDS_STORAGE_KEY = 'mapolycbe_student_passwords_v1';
const PASSWORD_RESET_REQUESTS_KEY = 'mapolycbe_password_reset_requests_v1';

// Seed demo accounts so mock/demo students have known initial passwords
const INITIAL_DEMO_RECORDS: StudentPasswordRecord[] = [
  {
    matricNo: 'CBT/2026/CS/0492',
    email: 'cbt.candidate@mapoly.edu.ng',
    fullName: 'Adewale Babatunde',
    level: 'ND1',
    currentPassword: 'Candidate@123!',
    initialBackendPassword: 'Candidate@123!',
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedBy: 'registration',
  },
  {
    matricNo: 'CBT/2026/CS/0493',
    email: 'chidinma.okonkwo@mapoly.edu.ng',
    fullName: 'Chidinma Okonkwo',
    level: 'ND2',
    currentPassword: 'Candidate@123!',
    initialBackendPassword: 'Candidate@123!',
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedBy: 'registration',
  },
  {
    matricNo: 'CBT/2026/TEST/9999',
    email: 'test9999@mapoly.edu.ng',
    fullName: 'Test Student',
    level: 'ND1',
    currentPassword: 'Password123!',
    initialBackendPassword: 'Password123!',
    updatedAt: new Date().toISOString(),
    updatedBy: 'registration',
  },
];

class PasswordService {
  private getStorageRecords(): Record<string, StudentPasswordRecord> {
    try {
      const raw = localStorage.getItem(STUDENT_PASSWORDS_STORAGE_KEY);
      if (!raw) {
        const initialMap: Record<string, StudentPasswordRecord> = {};
        INITIAL_DEMO_RECORDS.forEach((r) => {
          initialMap[r.matricNo.toLowerCase()] = r;
        });
        localStorage.setItem(STUDENT_PASSWORDS_STORAGE_KEY, JSON.stringify(initialMap));
        return initialMap;
      }
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private saveStorageRecords(records: Record<string, StudentPasswordRecord>): void {
    try {
      localStorage.setItem(STUDENT_PASSWORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save student password records:', e);
    }
  }

  public getStudentRecord(identifier: string): StudentPasswordRecord | null {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const records = this.getStorageRecords();

    // Direct match by matric
    if (records[clean]) return records[clean];

    // Search by email, matric without slash, or candidateId
    for (const key of Object.keys(records)) {
      const rec = records[key];
      if (
        rec.matricNo.toLowerCase() === clean ||
        (rec.email && rec.email.toLowerCase() === clean) ||
        (rec.candidateId && rec.candidateId.toLowerCase() === clean) ||
        rec.matricNo.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
      ) {
        return rec;
      }
    }
    return null;
  }

  public registerCandidatePassword(params: {
    matricNo: string;
    email: string;
    fullName?: string;
    level?: AcademicLevel;
    password: string;
  }): void {
    const records = this.getStorageRecords();
    const key = params.matricNo.trim().toLowerCase();
    records[key] = {
      matricNo: params.matricNo.trim(),
      email: params.email.trim(),
      fullName: params.fullName,
      level: params.level,
      currentPassword: params.password,
      initialBackendPassword: params.password,
      updatedAt: new Date().toISOString(),
      updatedBy: 'registration',
    };
    this.saveStorageRecords(records);
  }

  public adminSetStudentPassword(params: {
    candidateId?: string;
    matricNo: string;
    email?: string;
    fullName?: string;
    level?: AcademicLevel;
    newPassword: string;
    adminId?: string;
    adminNotes?: string;
  }): StudentPasswordRecord {
    const records = this.getStorageRecords();
    const key = params.matricNo.trim().toLowerCase();
    const existing: Partial<StudentPasswordRecord> = records[key] || this.getStudentRecord(params.matricNo) || {};

    const updatedRecord: StudentPasswordRecord = {
      matricNo: params.matricNo.trim(),
      email: params.email || existing.email || `${key}@mapoly.edu.ng`,
      candidateId: params.candidateId || existing.candidateId,
      fullName: params.fullName || existing.fullName,
      level: params.level || existing.level,
      currentPassword: params.newPassword,
      initialBackendPassword: existing.initialBackendPassword || existing.currentPassword || 'Candidate@123!',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
      adminId: params.adminId || 'admin_controller',
      adminNotes: params.adminNotes,
    };

    records[key] = updatedRecord;
    this.saveStorageRecords(records);

    // Auto-resolve any pending password reset requests for this student
    const requests = this.getPasswordResetRequests();
    const resolvedRequests = requests.map((req) => {
      if (
        req.status === 'pending' &&
        (req.matricNo.toLowerCase() === key || (req.email && req.email.toLowerCase() === (params.email || '').toLowerCase()))
      ) {
        return {
          ...req,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString(),
          resolvedByAdminId: params.adminId || 'admin_controller',
          adminNotes: params.adminNotes || 'Password reset by administrator',
          temporaryPasswordAssigned: params.newPassword,
        };
      }
      return req;
    });
    this.savePasswordResetRequests(resolvedRequests);

    return updatedRecord;
  }

  public studentChangePassword(params: {
    matricNo: string;
    currentPassword: string;
    newPassword: string;
  }): { success: boolean; message?: string } {
    const records = this.getStorageRecords();
    const key = params.matricNo.trim().toLowerCase();
    const record = records[key] || this.getStudentRecord(params.matricNo);

    if (!record) {
      // If student was not registered in local storage yet, register them with new password
      records[key] = {
        matricNo: params.matricNo.trim(),
        currentPassword: params.newPassword,
        initialBackendPassword: params.currentPassword,
        updatedAt: new Date().toISOString(),
        updatedBy: 'student',
      };
      this.saveStorageRecords(records);
      return { success: true };
    }

    if (record.currentPassword !== params.currentPassword) {
      return {
        success: false,
        message: 'The current password you entered is incorrect. Please check your existing password.',
      };
    }

    record.currentPassword = params.newPassword;
    record.updatedAt = new Date().toISOString();
    record.updatedBy = 'student';

    records[key] = record;
    this.saveStorageRecords(records);
    return { success: true };
  }

  public verifyStudentPassword(
    identifier: string,
    passwordAttempt: string
  ): { matches: boolean; hasRecord: boolean; record?: StudentPasswordRecord } {
    const record = this.getStudentRecord(identifier);
    if (!record) {
      return { matches: false, hasRecord: false };
    }
    const matches = record.currentPassword === passwordAttempt;
    return { matches, hasRecord: true, record };
  }

  // ========================================================
  // FORGOT PASSWORD / PASSWORD RESET REQUESTS
  // ========================================================

  public getPasswordResetRequests(): PasswordResetRequest[] {
    try {
      const raw = localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY);
      if (!raw) return [];
      const list: PasswordResetRequest[] = JSON.parse(raw);
      // Sort newest first
      return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    } catch {
      return [];
    }
  }

  private savePasswordResetRequests(requests: PasswordResetRequest[]): void {
    try {
      localStorage.setItem(PASSWORD_RESET_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save password reset requests:', e);
    }
  }

  public getPendingResetRequestsCount(): number {
    return this.getPasswordResetRequests().filter((r) => r.status === 'pending').length;
  }

  public createPasswordResetRequest(params: {
    matricNo: string;
    email: string;
    fullName?: string;
    reason?: string;
  }): PasswordResetRequest {
    const requests = this.getPasswordResetRequests();
    const existingStudent = this.getStudentRecord(params.matricNo);

    const newRequest: PasswordResetRequest = {
      id: `PR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      matricNo: params.matricNo.trim(),
      email: params.email.trim(),
      fullName: params.fullName || existingStudent?.fullName || 'Student Candidate',
      reason: params.reason?.trim() || 'Candidate requested password reset via portal',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    this.savePasswordResetRequests(requests);
    return newRequest;
  }

  public resolvePasswordResetRequest(
    requestId: string,
    params: { newPassword: string; adminId?: string; adminNotes?: string }
  ): PasswordResetRequest | null {
    const requests = this.getPasswordResetRequests();
    const target = requests.find((r) => r.id === requestId);
    if (!target) return null;

    target.status = 'resolved';
    target.resolvedAt = new Date().toISOString();
    target.resolvedByAdminId = params.adminId || 'admin_controller';
    target.adminNotes = params.adminNotes;
    target.temporaryPasswordAssigned = params.newPassword;

    // Apply the new password to student password store
    this.adminSetStudentPassword({
      matricNo: target.matricNo,
      email: target.email,
      fullName: target.fullName,
      newPassword: params.newPassword,
      adminId: params.adminId,
      adminNotes: params.adminNotes,
    });

    this.savePasswordResetRequests(requests);
    return target;
  }

  public rejectPasswordResetRequest(requestId: string, adminNotes?: string): PasswordResetRequest | null {
    const requests = this.getPasswordResetRequests();
    const target = requests.find((r) => r.id === requestId);
    if (!target) return null;

    target.status = 'rejected';
    target.resolvedAt = new Date().toISOString();
    target.adminNotes = adminNotes || 'Rejected by administrator';

    this.savePasswordResetRequests(requests);
    return target;
  }
}

export const passwordService = new PasswordService();
