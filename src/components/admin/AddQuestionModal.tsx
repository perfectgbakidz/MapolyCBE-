import React, { useState } from 'react';
import { Question } from '../../types';
import { X, PlusCircle, CheckCircle, Code } from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  examId: string;
  onClose: () => void;
  onSave: (qData: Omit<Question, 'id' | 'examId' | 'questionNumber'>) => Promise<void>;
  initialQuestion?: Question | null;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [text, setText] = useState(initialQuestion?.text || '');
  const [codeSnippet, setCodeSnippet] = useState(initialQuestion?.codeSnippet || '');
  const [showCode, setShowCode] = useState(Boolean(initialQuestion?.codeSnippet));
  const [optionA, setOptionA] = useState(initialQuestion?.options.find((o) => o.id === 'A')?.text || '');
  const [optionB, setOptionB] = useState(initialQuestion?.options.find((o) => o.id === 'B')?.text || '');
  const [optionC, setOptionC] = useState(initialQuestion?.options.find((o) => o.id === 'C')?.text || '');
  const [optionD, setOptionD] = useState(initialQuestion?.options.find((o) => o.id === 'D')?.text || '');
  const [correctOptionId, setCorrectOptionId] = useState<string>(initialQuestion?.correctOptionId || 'A');
  const [points, setPoints] = useState<number>(initialQuestion?.points || 2);
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [category, setCategory] = useState(initialQuestion?.category || 'General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedText = text.trim();
    if (!trimmedText) {
      setValidationError('Question statement / prompt is required.');
      return;
    }

    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();
    const trimmedC = optionC.trim();
    const trimmedD = optionD.trim();

    if (!trimmedA || !trimmedB || !trimmedC || !trimmedD) {
      setValidationError('All four options (A, B, C, D) are required and must not be empty.');
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(correctOptionId)) {
      setValidationError('Correct option must be one of A, B, C, or D.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        text: trimmedText,
        codeSnippet: showCode && codeSnippet.trim() ? codeSnippet.trim() : undefined,
        options: [
          { id: 'A', text: trimmedA },
          { id: 'B', text: trimmedB },
          { id: 'C', text: trimmedC },
          { id: 'D', text: trimmedD },
        ],
        correctOptionId,
        points: Number(points) || 2,
        explanation: explanation.trim() || undefined,
        category: category.trim() || 'General',
      });
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden my-8 animate-fadeIn text-stone-900">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {initialQuestion ? 'Edit Question' : 'Add Multiple-Choice Question'}
              </h3>
              <p className="text-xs text-stone-600 font-medium">Provide options, designate the correct key, and add explanation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {validationError}
            </div>
          )}

          {/* Question Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-stone-800">
                Question Statement / Prompt *
              </label>
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                {showCode ? 'Remove Code Snippet' : 'Attach Code Snippet'}
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Which scheduling algorithm is provably optimal in terms of minimizing average waiting time?"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 font-medium"
            />
          </div>

          {/* Optional Code Snippet */}
          {showCode && (
            <div>
              <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                Code / Data Snippet (Monospace)
              </label>
              <textarea
                rows={4}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste C / Python / SQL code block here..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Options A, B, C, D */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-stone-800">
              Multiple Choice Options &amp; Correct Answer Key *
            </label>

            {[
              { id: 'A', val: optionA, setVal: setOptionA, placeholder: 'Option A statement...' },
              { id: 'B', val: optionB, setVal: setOptionB, placeholder: 'Option B statement...' },
              { id: 'C', val: optionC, setVal: setOptionC, placeholder: 'Option C statement...' },
              { id: 'D', val: optionD, setVal: setOptionD, placeholder: 'Option D statement...' },
            ].map((opt) => {
              const isSelected = correctOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCorrectOptionId(opt.id)}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition border ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300 hover:text-stone-900'
                    }`}
                  >
                    {opt.id}
                  </button>

                  <input
                    type="text"
                    required
                    value={opt.val}
                    onChange={(e) => opt.setVal(e.target.value)}
                    placeholder={opt.placeholder}
                    className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 font-medium focus:outline-none"
                  />

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 pr-2">
                      <CheckCircle className="w-4 h-4 text-emerald-800" /> Correct Key
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Points Weight
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Sub-Category / Topic
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Virtual Memory, Cryptography"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Explanation &amp; Solution Rationale (Shown in Candidate Results Review)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the chosen option is correct for candidate feedback..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 font-medium focus:outline-none focus:border-emerald-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Question...' : initialQuestion ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
