import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { SecurityLogEvent, SecurityEventType } from '../types';
import { AdminNavbar } from '../components/common/AdminNavbar';
import { Footer } from '../components/common/Footer';
import { IntegrityCheckPanel } from '../components/admin/IntegrityCheckPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ShieldAlert,
  ShieldCheck,
  Filter,
  Search,
  RotateCw,
  Clock,
  Radio,
  Trash2,
  AlertTriangle,
  Lock,
  User,
  Globe,
  Terminal,
  FileCode2,
} from 'lucide-react';

export const AdminSecurityMonitoringPage: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await apiClient.getSecurityLogs({
        eventType: selectedEventType,
        severity: selectedSeverity,
        searchQuery: searchQuery.trim() || undefined,
        limit: 150,
      });
      setLogs(data);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 4000); // Live polling every 4s
    return () => clearInterval(interval);
  }, [selectedEventType, selectedSeverity]);

  const handleClearLogs = async () => {
    await apiClient.clearSecurityLogs();
    await fetchLogs();
  };

  const eventTypes: { label: string; value: string }[] = [
    { label: 'All Event Types (all)', value: 'all' },
    { label: 'Login Failed (login_failed)', value: 'login_failed' },
    { label: 'Login Success (login_success)', value: 'login_success' },
    { label: 'Account Locked (account_locked)', value: 'account_locked' },
    { label: 'Rate Limit Exceeded (rate_limit_exceeded)', value: 'rate_limit_exceeded' },
    { label: 'Response Submitted (response_submitted)', value: 'response_submitted' },
    { label: 'Exam Submitted (exam_submitted)', value: 'exam_submitted' },
    { label: 'Checksum Mismatch (checksum_mismatch)', value: 'checksum_mismatch' },
    { label: 'Tab Switch Suspect (tab_switch_suspect)', value: 'tab_switch_suspect' },
  ];

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-850 border border-emerald-300">
            LOW
          </span>
        );
    }
  };

  const formatEventType = (type: string) => {
    switch (type) {
      case 'AUTH_SUCCESS':
        return 'login_success';
      case 'AUTH_FAILURE':
        return 'login_failed';
      case 'RATE_LIMIT_TRIGGERED':
        return 'rate_limit_exceeded';
      case 'CHECKSUM_MISMATCH':
        return 'checksum_mismatch';
      case 'TAB_SWITCH_SUSPECT':
        return 'tab_switch_suspect';
      case 'UNAUTHORIZED_ACCESS_ATTEMPT':
        return 'account_locked';
      case 'ANSWER_PERSISTED':
        return 'response_submitted';
      case 'EXAM_SUBMITTED':
        return 'exam_submitted';
      default:
        return type.toLowerCase();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
                <ShieldAlert className="w-7 h-7 text-emerald-800" />
                Security Monitoring &amp; Tamper-Evidence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 font-mono">
                <Radio className="w-3 h-3 text-emerald-700 animate-pulse" /> Live Stream
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Live audit trail of security log events, authentication attempts, rate limiting, and cryptographic integrity verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="refresh_security_logs_btn"
              onClick={() => fetchLogs(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
            </button>

            <button
              type="button"
              id="clear_security_logs_btn"
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-semibold border border-stone-300 transition shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stream</span>
            </button>
          </div>
        </div>

        {/* Cryptographic Tamper-Evidence & Integrity Panel */}
        <IntegrityCheckPanel onLogGenerated={() => fetchLogs(true)} />

        {/* Security Logs Filter Controls (EventTypeFilter) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* EventTypeFilter Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="EventTypeFilter"
                  className="text-xs font-bold text-stone-700 shrink-0"
                >
                  Event Type:
                </label>
                <select
                  id="EventTypeFilter"
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-900 focus:outline-none focus:border-emerald-800 font-mono"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-700 shrink-0">Severity:</label>
                <select
                  id="SeverityFilter"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-800"
                >
                  <option value="ALL">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search_security_logs_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IP, actor, endpoint, details..."
                className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200 text-[11px] text-stone-500 font-medium">
            <span>Showing <strong className="text-stone-900 font-mono font-bold">{logs.length}</strong> logged audit records</span>
            <span>•</span>
            <span className="text-rose-700 font-mono font-bold">
              {logs.filter(l => l.severity === 'critical').length} Critical Alerts
            </span>
            <span>•</span>
            <span className="text-amber-700 font-mono font-bold">
              {logs.filter(l => l.severity === 'high').length} High Severity
            </span>
            <span>•</span>
            <span className="text-emerald-800 font-mono font-bold">
              {logs.filter(l => l.resolved).length} Resolved/Verified Clean
            </span>
          </div>
        </div>

        {/* SecurityLogTable Component */}
        <div
          id="SecurityLogTable"
          className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden"
        >
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-800" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                System Security Audit Trail (SecurityLog)
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500 font-medium">
              Columns: Timestamp • Event Type • Actor • IP • Endpoint • Details
            </span>
          </div>

          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner label="Querying security event ledger..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-stone-400" />
              <p className="text-sm font-semibold text-stone-800">No security events found</p>
              <p className="text-xs text-stone-500 mt-1">Try relaxing filters or check back as live examination activity occurs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-3 px-4 min-w-[130px]">Timestamp</th>
                    <th className="py-3 px-4 min-w-[160px]">Event Type</th>
                    <th className="py-3 px-4 min-w-[150px]">Actor</th>
                    <th className="py-3 px-3 min-w-[120px] font-mono">IP Address</th>
                    <th className="py-3 px-4 min-w-[160px] font-mono">Endpoint</th>
                    <th className="py-3 px-4 min-w-[280px]">Details &amp; Cryptography</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {logs.map((log) => {
                    const normalizedType = formatEventType(log.eventType);
                    return (
                      <tr key={log.id} className="hover:bg-stone-50/80 transition group">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block pl-5 font-normal">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Event Type */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(log.severity)}
                              <span className="font-mono text-xs font-bold text-stone-900">
                                {normalizedType}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {log.eventType}
                            </span>
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 text-[10px] font-bold">
                              {log.actorRole === 'candidate' ? 'C' : log.actorRole === 'admin' ? 'A' : '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 truncate max-w-[130px]">
                                {log.actorEmail || log.actorId}
                              </p>
                              <span className="text-[10px] text-stone-500 capitalize">
                                {log.actorRole}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* IP Address */}
                        <td className="py-3.5 px-3 font-mono text-xs text-emerald-900 whitespace-nowrap">
                          <span className="bg-stone-50 px-2 py-1 rounded border border-stone-200 inline-block font-semibold">
                            {log.sourceIp}
                          </span>
                        </td>

                        {/* Endpoint */}
                        <td className="py-3.5 px-4 font-mono text-xs text-stone-700">
                          <span className="bg-stone-50 px-2 py-1 rounded border border-stone-200 text-stone-700 truncate max-w-[180px] inline-block font-medium" title={log.endpoint || '/api/v1/action'}>
                            {log.endpoint || (log.examId ? `/api/v1/exams/${log.examId}` : '/api/v1/auth')}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium">{log.details}</p>
                          {log.payloadChecksum && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                              <span className="font-bold">HMAC:</span>
                              <span className="truncate max-w-[200px]" title={log.payloadChecksum}>
                                {log.payloadChecksum}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
