import React, { useState } from 'react';
import { IntegrityCheckResult, SingleIntegrityVerification } from '../../types';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  RotateCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Check,
  XCircle,
  Hash,
  ArrowRight,
} from 'lucide-react';

interface IntegrityCheckPanelProps {
  onLogGenerated?: () => void;
}

export const IntegrityCheckPanel: React.FC<IntegrityCheckPanelProps> = ({ onLogGenerated }) => {
  const { success, error, warning } = useToast();
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<IntegrityCheckResult | null>(null);

  // Manual Response or Result ID Verification Tool
  const [targetType, setTargetType] = useState<'response' | 'result'>('response');
  const [verifyIdInput, setVerifyIdInput] = useState<string>('');
  const [isVerifyingSingle, setIsVerifyingSingle] = useState<boolean>(false);
  const [singleVerification, setSingleVerification] = useState<SingleIntegrityVerification | null>(null);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      const result = await apiClient.runIntegrityAudit();
      setAuditResult(result);
      if (result.tamperedCount === 0) {
        success('Tamper-Evidence Check Passed', `Verified ${result.verifiedCount} candidate submission hashes against SHA-256 ledger.`);
      } else {
        warning('Integrity Anomalies Detected', `Found ${result.tamperedCount} signature discrepancies.`);
      }
      onLogGenerated?.();
    } catch {
      error('Integrity Audit Failed', 'Failed to communicate with cryptographic verification service.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleVerifySingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyIdInput.trim()) return;

    setIsVerifyingSingle(true);
    try {
      let result: SingleIntegrityVerification;
      if (targetType === 'response') {
        result = await apiClient.verifyResponseIntegrity(verifyIdInput.trim());
      } else {
        result = await apiClient.verifyResultIntegrity(verifyIdInput.trim());
      }

      setSingleVerification(result);
      if (result.intact) {
        success('Integrity Verified', `Checksum for ${targetType} "${result.id}" is authentic and valid.`);
      } else {
        warning('Tamper Flag Alert', `Cryptographic hash mismatch for ${targetType} "${result.id}".`);
      }
      onLogGenerated?.();
    } catch {
      error('Verification Error', 'Failed to verify payload integrity hash.');
    } finally {
      setIsVerifyingSingle(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-stone-900 space-y-6" id="IntegrityCheckPanel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-xs">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Cryptographic Tamper-Evidence &amp; Integrity Panel</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                SHA-256 HMAC
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Live verification tool for inspecting Response packets or Result scorecards against cryptographic merkle ledgers.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="run_integrity_audit_btn"
          onClick={handleRunAudit}
          disabled={isRunningAudit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
          <span>{isRunningAudit ? 'Hashing Submissions...' : 'Run Global Integrity Audit'}</span>
        </button>
      </div>

      {/* Manual Single Response / Result ID Verification Section (Section 3.13) */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-inner">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Manual Tamper-Check Tool (Inspect Specific Identifier)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-stone-500 font-semibold">
            GET /security/verify/{targetType}/:id
          </span>
        </div>

        <form onSubmit={handleVerifySingle} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Target Type Selector */}
            <div className="flex rounded-xl bg-white border border-stone-300 p-1 shrink-0">
              <button
                type="button"
                id="btn_target_type_response"
                onClick={() => {
                  setTargetType('response');
                  setVerifyIdInput('q_csc_401_01');
                  setSingleVerification(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  targetType === 'response'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Response ID
              </button>
              <button
                type="button"
                id="btn_target_type_result"
                onClick={() => {
                  setTargetType('result');
                  setVerifyIdInput('res_csc401_001');
                  setSingleVerification(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  targetType === 'result'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Result / Receipt ID
              </button>
            </div>

            {/* Identifier Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="integrity_verify_id_input"
                required
                value={verifyIdInput}
                onChange={(e) => setVerifyIdInput(e.target.value)}
                placeholder={
                  targetType === 'response'
                    ? 'Enter Answer Response ID or Checksum (e.g. q_csc_401_01)...'
                    : 'Enter Exam Result ID or Receipt Checksum (e.g. res_csc401_001)...'
                }
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              id="btn_verify_integrity"
              disabled={isVerifyingSingle || !verifyIdInput.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isVerifyingSingle ? 'animate-spin' : ''}`} />
              <span>{isVerifyingSingle ? 'Verifying...' : 'Verify'}</span>
            </button>
          </div>
        </form>

        {/* IntegrityResultBadge and Cryptographic Comparison */}
        {singleVerification && (
          <div
            id="IntegrityResultBadge"
            className={`mt-4 p-4 rounded-xl border transition animate-fadeIn ${
              singleVerification.intact
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div className="flex items-center gap-3">
                {singleVerification.intact ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {singleVerification.intact
                        ? 'INTEGRITY VERIFIED (PASS)'
                        : 'TAMPER DETECTED / CHECKSUM DISCREPANCY'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        singleVerification.intact
                          ? 'bg-emerald-800 text-white'
                          : 'bg-rose-700 text-white'
                      }`}
                    >
                      {singleVerification.targetType.toUpperCase()} #{singleVerification.id}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 text-stone-600 font-medium">{singleVerification.details}</p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-stone-500 sm:text-right font-medium">
                Verified at: {new Date(singleVerification.verifiedAt).toLocaleTimeString()}
              </div>
            </div>

            {/* Checksum Details Comparison */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-xs">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-1">
                  Stored HMAC Checksum:
                </span>
                <span className="text-emerald-900 font-semibold break-all">{singleVerification.expectedChecksum}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-xs">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-1">
                  Recomputed Payload Hash:
                </span>
                <span
                  className={`break-all ${
                    singleVerification.intact ? 'text-emerald-900 font-semibold' : 'text-rose-700 font-bold'
                  }`}
                >
                  {singleVerification.computedChecksum}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Audit Summary Banner */}
      {auditResult && (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {auditResult.status === 'passed' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-stone-900">
                  Global Examination Repository Status:{' '}
                  {auditResult.status === 'passed'
                    ? 'ALL SUBMISSIONS VERIFIED CLEAN'
                    : 'TAMPER EVIDENCE DETECTED'}
                </span>
                <p className="text-[11px] text-stone-500">
                  {auditResult.verifiedCount} valid signatures • {auditResult.tamperedCount} anomalies • Checked at{' '}
                  {new Date(auditResult.lastAuditTimestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> 100% Intact
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
