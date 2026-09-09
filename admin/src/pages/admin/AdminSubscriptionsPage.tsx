import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Subscription } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getSubscriptions();
      setSubscriptions(res.subscriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">SaaS Subscriptions Registry</h1>
        <p className="text-sm text-slate-500 mt-1">Provider-agnostic subscription lifecycle records and plan assignments</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading subscriptions data..." />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No subscription records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parent</th>
                  <th className="px-6 py-4">Assigned Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((s) => {
                  const parent: any = s.parentId;
                  const plan: any = s.planId;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div>{parent?.name || 'Parent'}</div>
                        <div className="text-xs font-normal text-slate-500">{parent?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          {plan?.name || 'Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
