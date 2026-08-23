import React from 'react';
import { AlertTriangle, CheckCircle, Flag, Clock, X, Lock } from 'lucide-react';

interface ConfirmSubmitModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmSubmitModal: React.FC<ConfirmSubmitModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  flaggedCount,
  isSubmitting,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <div
      id="confirm_submit_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
    >
      <div
        id="confirm_submit_modal"
        className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden p-6 text-stone-900 animate-fadeIn"
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Final Exam Submission</h3>
              <p className="text-xs text-stone-500 font-medium">Review your summary before locking responses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if unanswered */}
        {hasUnanswered && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-rose-900">Caution: Incomplete Submission</strong>
              You have <span className="font-bold underline">{unansweredCount} unanswered questions</span>. Questions left blank will receive 0 points.
            </div>
          </div>
        )}

        {/* Status Metrics Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs font-bold mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Answered</span>
            </div>
            <span className="font-mono text-xl font-black text-stone-900">{answeredCount}</span>
            <span className="text-[10px] text-stone-500 block">of {totalQuestions}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Unanswered</span>
            </div>
            <span className="font-mono text-xl font-black text-rose-700">{unansweredCount}</span>
            <span className="text-[10px] text-stone-500 block">remaining</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-bold mb-1">
              <Flag className="w-3.5 h-3.5" />
              <span>Flagged</span>
            </div>
            <span className="font-mono text-xl font-black text-amber-700">{flaggedCount}</span>
            <span className="text-[10px] text-stone-500 block">for review</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-stone-600 leading-relaxed text-center font-medium">
          Upon submitting, your responses will be cryptographically sealed with a SHA-256 tamper-proof receipt. You cannot make any further changes.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 transition"
          >
            Back to Questions
          </button>
          <button
            type="button"
            id="confirm_submit_exam_final_btn"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {isSubmitting ? 'Sealing & Grading...' : 'Confirm & Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};
