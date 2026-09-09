import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Baby, Smartphone, Building2 } from 'lucide-react';

export const AdminChildrenPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getChildren();
      setChildrenList(res.children);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Global Children Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Cross-tenant inspection of registered children profiles and device pairings</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading children directory..." />
          </div>
        ) : childrenList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No child profiles found across tenants.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Child Name</th>
                  <th className="px-6 py-4">Parent / Family</th>
                  <th className="px-6 py-4">Paired Device</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {childrenList.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-pink-400" />
                      <span>{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-200">{c.parentId?.name || 'Parent'}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{c.tenantId?.name || 'Family'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {c.deviceId ? (
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{c.deviceId.deviceName || 'Device'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unpaired</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        c.profileStatus === 'paired' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.profileStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
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
