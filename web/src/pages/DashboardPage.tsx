import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { childrenApi } from '../api/childrenApi';
import { geofenceApi } from '../api/geofenceApi';
import { alertApi } from '../api/alertApi';
import { familyApi } from '../api/familyApi';
import { ChildProfile, Geofence, Alert as AlertType } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  ShieldAlert,
  Bell,
  Smartphone,
  MapPin,
  Plus,
  ArrowRight,
  Battery,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, tenant } = useAuth();

  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [childrenLimit, setChildrenLimit] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedChildren, fetchedGeofences, fetchedAlerts, familyRes] = await Promise.all([
        childrenApi.getChildren(),
        geofenceApi.getGeofences(),
        alertApi.getAlerts(),
        familyApi.getFamilyDetails().catch(() => null),
      ]);

      setChildrenList(fetchedChildren);
      setGeofences(fetchedGeofences);
      setAlerts(fetchedAlerts);
      if (familyRes?.family?.childrenLimit) {
        setChildrenLimit(familyRes.family.childrenLimit);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'GuardianX couldn’t load your family dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const pairedChildren = childrenList.filter((c) => c.profileStatus === 'paired');
  const onlineDevicesCount = childrenList.filter((c) => c.device?.isOnline).length;
  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3 animate-skeleton" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-500/10 via-white to-slate-50 p-6 border border-slate-200 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" /> Parent Safety Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back, {user?.name || 'Parent'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Family: <span className="text-slate-900 font-semibold">{tenant?.name}</span> | Plan:{' '}
            <span className="text-teal-600 font-bold">{tenant?.plan}</span> ({childrenList.length}/{childrenLimit} slots used)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/family">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Child Profile
            </Button>
          </Link>
          <Link to="/location">
            <Button variant="outline" icon={<MapPin className="w-4 h-4" />}>
              Live Map
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-sm text-rose-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-teal-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Monitored Children</span>
            <div className="p-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{childrenList.length}</span>
            <span className="text-xs text-slate-500">{pairedChildren.length} Paired</span>
          </div>
        </Card>

        <Card className="hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Online Devices</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{onlineDevicesCount}</span>
            <Badge variant={onlineDevicesCount > 0 ? 'success' : 'neutral'} size="sm">
              {onlineDevicesCount > 0 ? 'Connected' : 'Standby'}
            </Badge>
          </div>
        </Card>

        <Card className="hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Safe Zones</span>
            <div className="p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{geofences.length}</span>
            <span className="text-xs text-slate-500">Configured</span>
          </div>
        </Card>

        <Card className="hover:border-rose-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Alerts</span>
            <div className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{unreadAlertsCount}</span>
            <Badge variant={unreadAlertsCount > 0 ? 'danger' : 'success'} size="sm">
              {unreadAlertsCount > 0 ? 'Action Needed' : 'All Clear'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Children Status Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Children & Device Overview</h2>
          <Link to="/family" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            Manage Family <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {childrenList.length === 0 ? (
          <EmptyState
            title="No Children Profiles Added Yet"
            description="Add your first child profile to generate a pairing code and link their mobile device."
            action={
              <Link to="/family">
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                  Add Child Profile Now
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childrenList.map((child) => (
              <Card key={child.id || child._id} className="relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-lg">
                      {child.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{child.name}</h3>
                      <div className="mt-0.5">
                        <Badge
                          variant={child.profileStatus === 'paired' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {child.profileStatus === 'paired' ? 'Device Paired' : 'Unpaired'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Device:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {child.device?.deviceName || 'No device linked'}
                    </span>
                  </div>

                  {child.device && (
                    <>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Battery className="w-3.5 h-3.5 text-slate-400" /> Battery:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {child.device.batteryLevel}% {child.device.isOnline ? '(Online)' : '(Offline)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Platform:
                        </span>
                        <span className="font-semibold text-slate-900 uppercase">
                          {child.device.platform}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5">
                  <Link to={`/children/${child.id || child._id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Safety Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Safety Alerts</h2>
          <Link to="/alerts" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            View All Alerts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <div className="text-center py-6 text-slate-500 text-sm">
              <CheckCircle2Icon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>No alerts recorded for your family. All clear!</span>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id || alert._id}
                className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl flex items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : alert.severity === 'high'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-sky-50 text-sky-600 border border-sky-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{alert.title}</div>
                    <div className="text-xs text-slate-600">{alert.message}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Badge variant={alert.isRead ? 'neutral' : 'danger'} size="sm">
                    {alert.isRead ? 'Read' : 'New'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircle2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
