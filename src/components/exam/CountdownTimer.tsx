import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string; // ISO date string
  durationMinutes: number;
  onTimeExpire: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  durationMinutes,
  onTimeExpire,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return remaining;
  });

  const hasExpiredRef = useRef(false);
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        onTimeExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onTimeExpire]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  const percentLeft = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  // Determine urgency state
  const isCritical = secondsLeft <= 120; // < 2 mins
  const isWarning = secondsLeft <= 300 && secondsLeft > 120; // < 5 mins

  return (
    <div
      id="exam_countdown_timer"
      className={`relative overflow-hidden rounded-xl border p-3.5 transition-all shadow-xs ${
        isCritical
          ? 'bg-rose-50 border-rose-400 text-rose-900 animate-pulse'
          : isWarning
          ? 'bg-amber-50 border-amber-400 text-amber-900'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <Flame className="w-5 h-5 text-rose-600 animate-bounce" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <Clock className="w-5 h-5 text-emerald-800" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Time Remaining
          </span>
        </div>

        <div className="font-mono text-xl sm:text-2xl font-black tracking-wider tabular-nums text-stone-900">
          {formattedTime}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2.5 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isCritical
              ? 'bg-rose-600'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-700'
          }`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>

      {isCritical && (
        <p className="text-[11px] text-rose-700 font-bold mt-1.5 text-center">
          Critical: Examination will auto-submit when the countdown reaches zero!
        </p>
      )}
    </div>
  );
};
