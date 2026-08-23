import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading exam environment...',
  sublabel = 'Establishing encrypted session & verifying checksum signatures...',
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center" id="mapolycbe_loading_container">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-slate-700/60 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-100 tracking-wide">{label}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{sublabel}</p>
    </div>
  );
};
