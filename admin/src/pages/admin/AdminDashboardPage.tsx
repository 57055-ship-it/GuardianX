import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardStats } from '../../types';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  Users,
  Baby,
  Building2,
  CheckCircle2,
  Clock,
  UserX,
  Smartphone,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getDashboard();
      setStats(data.stats);
      setCharts(data.charts);
    } catch (err: any) {
      setError(err.message || 'Failed to load Super Admin dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3 animate-skeleton" />
        <CardSkeleton count={8} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
        {error || 'Dashboard data unavailable.'}
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Total Parents', value: stats.totalParents, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { label: 'Total Children', value: stats.totalChildren, icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Total Families', value: stats.totalFamilies, icon: Building2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Trial Users', value: stats.trialUsers, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Suspended Users', value: stats.suspendedUsers, icon: UserX, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Active Devices', value: stats.activeDevices, icon: Smartphone, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">SaaS Control Plane Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time aggregate data across GuardianX tenants and system components</p>
      </div>

      {/* Billing Notice Banner */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Billing Integration Status</h4>
            <p className="text-xs text-slate-500">{stats.billingMessage}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
          Provider-Agnostic Mode
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Telemetry & Operations</h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-700 font-semibold">Locations Received Today</span>
            </div>
            <span className="text-sm font-black text-slate-900">{stats.locationsToday.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-700 font-semibold">Total SOS Alerts</span>
            </div>
            <span className="text-sm font-black text-slate-900">{stats.totalSOS.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-slate-700 font-semibold">Safe Zones (Geofences)</span>
            </div>
            <span className="text-sm font-black text-slate-900">{stats.totalSafeZones.toLocaleString()}</span>
          </div>
        </div>

        {/* Plan Distribution Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tenant Distribution by Plan</h3>

          <div className="space-y-3">
            {charts?.planDistribution?.map((item: any, idx: number) => {
              const percentage = stats.totalFamilies > 0 ? Math.round((item.count / stats.totalFamilies) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 uppercase">{item.plan} PLAN</span>
                    <span className="text-slate-500 font-medium">{item.count} Families ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
