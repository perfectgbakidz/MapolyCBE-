import React, { useState } from 'react';
import { Question, AnswerRecord } from '../../types';
import { Check, Flag } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, AnswerRecord>;
  onSelectQuestion: (index: number) => void;
}

type FilterType = 'all' | 'unanswered' | 'answered' | 'flagged';

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  onSelectQuestion,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const total = questions.length;
  const answeredCount = (Object.values(answers) as AnswerRecord[]).filter((a) => a.selectedOptionId).length;
  const flaggedCount = (Object.values(answers) as AnswerRecord[]).filter((a) => a.markedForReview).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs" id="exam_question_navigator">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Question Navigator
        </h4>
        <span className="text-xs font-mono text-emerald-800 font-bold">
          {answeredCount}/{total} Answered
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-3 bg-stone-100 p-1 rounded-lg border border-stone-200 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`py-1 rounded text-center transition ${
            filter === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All ({total})
        </button>
        <button
          type="button"
          onClick={() => setFilter('answered')}
          className={`py-1 rounded text-center transition ${
            filter === 'answered' ? 'bg-emerald-800 text-white font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Done ({answeredCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('flagged')}
          className={`py-1 rounded text-center transition ${
            filter === 'flagged' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Flagged ({flaggedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unanswered')}
          className={`py-1 rounded text-center transition ${
            filter === 'unanswered' ? 'bg-rose-700 text-white font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Pending ({unansweredCount})
        </button>
      </div>

      {/* Grid of Question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const isAnswered = Boolean(ans && ans.selectedOptionId);
          const isFlagged = Boolean(ans && ans.markedForReview);
          const isCurrent = currentIndex === idx;

          // Filter matching
          if (filter === 'answered' && !isAnswered) return null;
          if (filter === 'unanswered' && isAnswered) return null;
          if (filter === 'flagged' && !isFlagged) return null;

          return (
            <button
              key={q.id}
              type="button"
              id={`nav_q_btn_${idx + 1}`}
              onClick={() => onSelectQuestion(idx)}
              className={`relative h-10 w-full rounded-lg font-mono text-sm font-bold flex items-center justify-center transition border ${
                isCurrent
                  ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-600/50 shadow-md scale-105 z-10'
                  : isFlagged
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : isAnswered
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span>{idx + 1}</span>

              {/* Status Icons */}
              {isFlagged && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-0.5 rounded-full shadow-xs">
                  <Flag className="w-2.5 h-2.5 fill-current" />
                </span>
              )}

              {isAnswered && !isFlagged && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-0.5 rounded-full shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-800 border border-emerald-900 inline-block"></span>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 inline-block"></span>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block"></span>
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-stone-100 border border-stone-300 inline-block"></span>
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
};
