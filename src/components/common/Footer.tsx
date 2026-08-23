import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Cpu, Clock } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="mapolycbe_global_footer" className="w-full bg-white border-t border-stone-200 py-6 text-stone-600 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Encryption badge */}
        <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-stone-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>MapolyCBE Official Examination System</span>
          </div>
          <span className="hidden sm:inline text-stone-300">|</span>
          <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-850" />
            <span>SHA-256 HMAC Sealed</span>
          </div>
          <span className="hidden sm:inline text-stone-300">|</span>
          <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-emerald-800" />
            <span>Sub-second Cloud Sync</span>
          </div>
        </div>

        {/* Center/Right: Clock and Quick Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-mono text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>{timeStr || 'LIVE'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="footer_link_register"
              onClick={() => navigate('/register')}
              className="text-emerald-800 hover:text-emerald-900 font-semibold transition"
            >
              New Candidate Register
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              id="footer_link_login"
              onClick={() => navigate('/login')}
              className="text-stone-600 hover:text-stone-900 transition font-medium"
            >
              Candidate Login
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              id="footer_link_admin_login"
              onClick={() => navigate('/admin/login')}
              className="text-stone-600 hover:text-emerald-900 transition font-medium"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
