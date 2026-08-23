import React, { useState, useEffect, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('MapolyCBE Runtime Error Intercepted:', event.error);
      setHasError(true);
      setErrorMessage(event.message || 'An unexpected runtime error occurred.');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('MapolyCBE Unhandled Promise Rejection:', event.reason);
      setHasError(true);
      setErrorMessage(event.reason?.message || String(event.reason) || 'Async operation rejected.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setErrorMessage('');
    window.location.href = '/';
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6" id="error_boundary_container">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-400">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Unexpected Runtime Exception</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The examination client encountered a state fault. Don&apos;t worry — your background answer writes are preserved in the tamper-evidence journal.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left mb-6 overflow-x-auto">
            <p className="text-xs font-mono text-rose-400/90">{errorMessage || 'Unknown internal fault'}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-lg shadow-emerald-950"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
