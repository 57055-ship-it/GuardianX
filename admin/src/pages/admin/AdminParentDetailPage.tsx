import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { ArrowLeft, User, Building2, Baby, Smartphone, ShieldCheck } from 'lucide-react';

export const AdminParentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchParentDetail(id);
  }, [id]);

  const fetchParentDetail = async (parentId: string) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getParentById(parentId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch parent detail.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Fetching parent details & child relationships..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate('/parents')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Parents
        </Button>
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error || 'Parent account details unavailable.'}
        </div>
      </div>
    );
  }

  const { parent, tenant, subscription, children, devices, usageSummary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate('/parents')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{parent.name}</h1>
          <p className="text-xs text-slate-600">{parent.email}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" /> Account Status
            </h3>
            {parent.isActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Suspended
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">User ID</span>
              <span className="font-mono text-slate-700">{parent._id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Family Tenant</span>
              <span className="font-bold text-slate-900">{tenant?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Plan</span>
              <span className="font-bold text-amber-700 uppercase">{tenant?.plan || 'FREE'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Registered Date</span>
              <span className="text-slate-700">{new Date(parent.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Subscription Info
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
              {subscription?.status || tenant?.subscriptionStatus || 'active'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Children Limit</span>
              <span className="font-bold text-slate-900">{usageSummary.childrenCount} / {tenant?.childrenLimit || 1}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Safe Zones</span>
              <span className="font-bold text-slate-900">{usageSummary.geofenceCount} Safe Zones</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Start Date</span>
              <span className="text-slate-700">{subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> Resource Usage
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-500">Children</div>
              <div className="text-xl font-black text-slate-900 mt-1">{children.length}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-500">Devices</div>
              <div className="text-xl font-black text-slate-900 mt-1">{devices.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Children Profiles Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Baby className="w-4 h-4 text-teal-600" /> Children Profiles ({children.length})
        </h3>

        {children.length === 0 ? (
          <div className="text-xs text-slate-500 py-4">No child profiles created for this parent account yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((c: any) => (
              <div key={c._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    c.profileStatus === 'paired' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {c.profileStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Device: {c.deviceId?.deviceName || 'No paired device'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
