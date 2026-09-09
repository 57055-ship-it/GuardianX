import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { AuditLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAuditLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable audit trail of all control plane actions and administrative state mutations</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading audit trail..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No administrative audit log entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                      {l.adminEmail || 'super_admin'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="font-bold text-slate-900">{l.targetType}</span>
                      {l.targetId && <span className="text-slate-500 text-[10px] block font-mono">{l.targetId}</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {JSON.stringify(l.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
