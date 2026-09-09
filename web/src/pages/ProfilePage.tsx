import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { familyApi } from '../api/familyApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User as UserIcon, Mail, Shield, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, tenant, logout, refreshProfile } = useAuth();
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<boolean>(false);

  const handleUpdatePlan = async (newPlan: 'FREE' | 'FAMILY' | 'PREMIUM') => {
    if (!window.confirm(`Upgrade subscription plan to ${newPlan}?`)) return;
    setIsUpdatingPlan(true);
    try {
      await familyApi.updatePlan(newPlan);
      await refreshProfile();
      alert(`Plan successfully updated to ${newPlan}!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update plan.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Account & Security Settings</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your Parent profile, family tenant, and subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Parent Profile Information">
          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-2xl">
                {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                <span className="text-slate-600">{user?.email}</span>
                <div className="mt-1">
                  <Badge variant="info" size="sm">
                    ROLE: {user?.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
                <span>Account ID:</span>
                <span className="font-mono text-slate-900">{user?.id || user?._id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
                <span>Family Household:</span>
                <span className="font-bold text-slate-900">{tenant?.name}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Tenant ID:</span>
                <span className="font-mono text-slate-900">{tenant?.id || tenant?._id}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button variant="danger" onClick={logout} className="w-full">
                Sign Out of Web Portal
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Subscription Plan & Entitlements">
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-slate-600 font-semibold uppercase">Current Family Plan</div>
                <div className="text-2xl font-black text-teal-700 mt-1">{tenant?.plan} Plan</div>
                <div className="text-slate-600 mt-0.5">
                  Children Limit: <span className="font-bold text-slate-900">{tenant?.childrenLimit} Slots</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-teal-600" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Select Subscription Tier:
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {(['FREE', 'FAMILY', 'PREMIUM'] as const).map((plan) => {
                  const isCurrent = tenant?.plan === plan;
                  return (
                    <button
                      key={plan}
                      onClick={() => !isCurrent && handleUpdatePlan(plan)}
                      disabled={isCurrent || isUpdatingPlan}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{plan}</div>
                      <div className="text-[10px] opacity-80 mt-1">
                        {plan === 'FREE' ? '1 Child' : plan === 'FAMILY' ? '3 Children' : '10 Children'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
