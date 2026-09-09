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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Children Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Cross-tenant inspection of registered children profiles and device pairings</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading children directory..." />
          </div>
        ) : childrenList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No child profiles found across tenants.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Child Name</th>
                  <th className="px-6 py-4">Parent / Family</th>
                  <th className="px-6 py-4">Paired Device</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childrenList.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-teal-600" />
                      <span>{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800">{c.parentId?.name || 'Parent'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{c.tenantId?.name || 'Family'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {c.deviceId ? (
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{c.deviceId.deviceName || 'Device'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unpaired</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        c.profileStatus === 'paired' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.profileStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
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
