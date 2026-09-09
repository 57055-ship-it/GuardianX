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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Families (Tenants) Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Global multi-tenant family overview, owner linkage, and active plans</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading families registry..." />
          </div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No family tenants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Family Name</th>
                  <th className="px-6 py-4">Owner (Parent)</th>
                  <th className="px-6 py-4">Current Plan</th>
                  <th className="px-6 py-4">Children / Devices</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>{f.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800">{f.ownerId?.name || 'Owner'}</div>
                      <div className="text-[11px] text-slate-500">{f.ownerId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                        {f.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <div className="font-bold text-slate-900">{f.childrenCount} Children</div>
                      <div className="text-slate-500">{f.devicesCount} Devices</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
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
