import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Building2 } from 'lucide-react';

export const AdminFamiliesPage: React.FC = () => {
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getFamilies();
      setFamilies(res.families);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Families (Tenants) Directory</h1>
        <p className="text-sm text-slate-400 mt-1">Global multi-tenant family overview, owner linkage, and active plans</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading families registry..." />
          </div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No family tenants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Family Name</th>
                  <th className="px-6 py-4">Owner (Parent)</th>
                  <th className="px-6 py-4">Current Plan</th>
                  <th className="px-6 py-4">Children / Devices</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {families.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>{f.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-200">{f.ownerId?.name || 'Owner'}</div>
                      <div className="text-[11px] text-slate-400">{f.ownerId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        {f.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      <div>{f.childrenCount} Children</div>
                      <div className="text-slate-500">{f.devicesCount} Devices</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(f.createdAt).toLocaleDateString()}
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
