import React, { useState } from 'react';
import { CloudCheck, RefreshCw, AlertCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string;
  latencyMs?: number;
  lastChecksum?: string;
  errorMessage?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSavedAt,
  latencyMs,
  lastChecksum,
  errorMessage,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-end" id="exam_autosave_indicator">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition shadow-xs ${
          status === 'saving'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : status === 'saved' || status === 'idle'
            ? 'bg-white border-stone-200 text-stone-800'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}
      >
        {status === 'saving' ? (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-800 animate-spin" />
            <span className="font-semibold text-emerald-900">Syncing answer...</span>
          </div>
        ) : status === 'saved' || status === 'idle' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-800" />
            </div>
            <span className="font-semibold text-stone-800">Auto-saved to Cloud</span>
            {latencyMs !== undefined && (
              <span className="font-mono text-[11px] text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded font-bold">
                {latencyMs}ms
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold">Sync error</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition"
          title="Toggle cryptographic checksum info"
        >
          {showDetails ? <ChevronUp className="w-3 h-3 text-stone-700" /> : <ChevronDown className="w-3 h-3 text-stone-500" />}
        </button>
      </div>

      {/* Expanded Security & Checksum telemetry dropdown */}
      {showDetails && (
        <div className="mt-2 p-3 bg-white border border-stone-200 rounded-xl shadow-lg max-w-xs text-left z-20 text-[11px] text-stone-700 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1.5 pb-1 border-b border-stone-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Anti-Tamper Live Journal</span>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Status:</span>
              <span className="text-emerald-800 font-bold">Encrypted &amp; Synced</span>
            </div>
            {lastSavedAt && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Time:</span>
                <span className="text-stone-700 font-semibold">{new Date(lastSavedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {lastChecksum && (
              <div>
                <span className="text-stone-500 font-sans block mb-0.5">SHA-256 Digest:</span>
                <p className="p-1 rounded bg-stone-50 text-emerald-900 truncate select-all border border-stone-200 font-semibold">
                  {lastChecksum}
                </p>
              </div>
            )}
            {errorMessage && (
              <p className="text-rose-700 font-sans text-[11px] mt-1 bg-rose-50 p-1.5 rounded border border-rose-300 font-semibold">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
