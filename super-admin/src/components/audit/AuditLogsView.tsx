import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileCode,
  X,
  ExternalLink,
  Lock,
  Download,
  Terminal,
  Activity,
  Copy,
  Check,
} from 'lucide-react';
import { AuditLog, AuditActionType } from '../../types';
import { useToast } from '../common/Toast';

interface AuditLogsViewProps {
  logs: AuditLog[];
  onSelectTenantById?: (tenantId: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onSelectTenantById }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [activeDiffLog, setActiveDiffLog] = useState<AuditLog | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const handleCopyPayload = (log: AuditLog) => {
    navigator.clipboard.writeText(JSON.stringify(log.diffPayload || {}, null, 2));
    setCopiedPayload(true);
    showToast('Payload Copied', 'Raw JSON payload copied to clipboard.', 'success');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const handleExportAuditTrailCSV = () => {
    const headers = 'Event ID,Timestamp,Admin Name,Admin Email,Action,Target Tenant ID,Target Tenant Name,Details,IP Address\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.adminName}","${l.adminEmail}","${l.action}","${l.targetTenantId}","${l.targetTenantName}","${l.details.replace(/"/g, '""')}","${l.ipAddress}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Audit Trail Exported', `Downloaded ${filteredLogs.length} audit log events to CSV.`, 'success');
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'TENANT_IMPERSONATED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 font-mono">
            IMPERSONATE
          </span>
        );
      case 'TENANT_CREATED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 font-mono">
            PROVISION
          </span>
        );
      case 'USER_CREATED':
      case 'USER_REGISTERED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800/60 font-mono">
            USER_CREATED
          </span>
        );
      case 'USER_UPDATED':
      case 'USER_STATUS_CHANGED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60 font-mono">
            USER_UPDATED
          </span>
        );
      case 'USER_SUSPENDED':
      case 'USER_DELETED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 font-mono">
            USER_REVOKED
          </span>
        );
      case 'LIMITS_UPDATED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60 font-mono">
            UPDATE_LIMITS
          </span>
        );
      case 'FEATURE_FLAG_TOGGLED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/60 font-mono">
            FLAG_TOGGLE
          </span>
        );
      case 'BATCH_NOTICE_DISPATCHED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 font-mono">
            FLEET_NOTICE
          </span>
        );
      case 'SUBSCRIPTION_PAUSED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 font-mono">
            SUSPEND_ACCESS
          </span>
        );
      case 'PRICING_UPDATED':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60 font-mono">
            TIER_CATALOG
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Immutable Super Admin Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cryptographically signed event ledger of all elevated administrative commands, impersonations, and quota modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            SOC2 Type II & HIPAA Logged
          </span>
          <button
            onClick={handleExportAuditTrailCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f141f] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by admin, action, tenant ID or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Action Filter:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="TENANT_IMPERSONATED">Impersonations</option>
            <option value="TENANT_CREATED">Tenant Created</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_SUSPENDED">User Suspended/Deleted</option>
            <option value="LIMITS_UPDATED">Limits Updated</option>
            <option value="FEATURE_FLAG_TOGGLED">Feature Flags</option>
            <option value="BATCH_NOTICE_DISPATCHED">Batch Notices</option>
            <option value="SUBSCRIPTION_PAUSED">Subscription Paused</option>
            <option value="PRICING_UPDATED">Pricing Catalog Updated</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-3">Super Admin Actor</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Target Tenant</th>
                <th className="py-3 px-3">Operation Description</th>
                <th className="py-3 px-3">Timestamp & IP</th>
                <th className="py-3 pr-4 pl-2 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                    {log.id}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={log.adminAvatar}
                        alt={log.adminName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.adminName.split('(')[0]}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {onSelectTenantById ? (
                      <button
                        onClick={() => onSelectTenantById(log.targetTenantId)}
                        className="text-left group/t block hover:opacity-80 transition-opacity cursor-pointer"
                        title="Click to inspect restaurant details & limits in drawer"
                      >
                        <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover/t:text-indigo-600 dark:group-hover/t:text-indigo-400 group-hover/t:underline flex items-center gap-1">
                          <span>{log.targetTenantName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/t:opacity-100 transition-opacity text-indigo-500" />
                        </p>
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                          {log.targetTenantId}
                        </span>
                      </button>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.targetTenantName}
                        </p>
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                          {log.targetTenantId}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-[11px]">
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{log.timestamp}</p>
                    <p className="text-slate-400 font-mono text-[10px]">{log.ipAddress}</p>
                  </td>
                  <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                    {log.diffPayload ? (
                      <button
                        onClick={() => setActiveDiffLog(log)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Inspect Diff</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive JSON Diff Inspector Modal */}
      {activeDiffLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Audit Diff Payload: {activeDiffLog.id}
                </span>
              </div>
              <button
                onClick={() => setActiveDiffLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-slate-500">Operation:</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeDiffLog.details}
                </p>
              </div>

              {/* Pretty Diff Block */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 overflow-x-auto">
                <p className="text-slate-400">
                  Target: {activeDiffLog.targetTenantName} ({activeDiffLog.targetTenantId})
                </p>
                <p className="text-slate-400">Actor: {activeDiffLog.adminEmail}</p>
                <div className="my-2 border-t border-slate-800" />
                {activeDiffLog.diffPayload?.before !== undefined && (
                  <div className="text-rose-400 flex items-start gap-2">
                    <span>-</span>
                    <span>
                      before: {JSON.stringify(activeDiffLog.diffPayload.before, null, 2)}
                    </span>
                  </div>
                )}
                {activeDiffLog.diffPayload?.after !== undefined && (
                  <div className="text-emerald-400 flex items-start gap-2">
                    <span>+</span>
                    <span>
                      after: {JSON.stringify(activeDiffLog.diffPayload.after, null, 2)}
                    </span>
                  </div>
                )}
                {activeDiffLog.diffPayload?.metadata && (
                  <div className="pt-2 text-indigo-300">
                    <span>metadata: {JSON.stringify(activeDiffLog.diffPayload.metadata, null, 2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => handleCopyPayload(activeDiffLog)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy JSON Payload</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveDiffLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
