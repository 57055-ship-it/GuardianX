import React, { useState, useEffect } from 'react';
import { childrenApi } from '../api/childrenApi';
import { usageApi } from '../api/usageApi';
import { ChildProfile, AppUsageItem } from '../types';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Smartphone, Clock, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DigitalWellbeingPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [screenTimeMinutes, setScreenTimeMinutes] = useState<number>(0);
  const [appUsage, setAppUsage] = useState<AppUsageItem[]>([]);
  const [isIOSUnavailable, setIsIOSUnavailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await childrenApi.getChildren();
      setChildrenList(fetchedChildren);

      if (fetchedChildren.length > 0) {
        const firstId = fetchedChildren[0].id || fetchedChildren[0]._id;
        setSelectedChildId(firstId);
        await loadChildUsage(firstId);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildUsage = async (childId: string) => {
    try {
      const [st, usage] = await Promise.all([
        usageApi.getScreenTime(childId),
        usageApi.getAppUsage(childId),
      ]);
      setScreenTimeMinutes(st.totalScreenTimeMinutes);
      setAppUsage(usage.appUsage);
      setIsIOSUnavailable(usage.isIOSUnavailable || false);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    loadChildUsage(childId);
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Digital Wellbeing Statistics..." />;
  }

  const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Digital Wellbeing</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor screen time usage and application engagement for your children
        </p>
      </div>

      {childrenList.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {childrenList.map((c) => {
            const cId = c.id || c._id;
            const isSelected = cId === selectedChildId;
            return (
              <button
                key={cId}
                onClick={() => handleSelectChild(cId)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {childrenList.length === 0 ? (
        <EmptyState
          title="No Children Profiles Found"
          description="Add a child profile to view screen time and digital wellbeing metrics."
        />
      ) : (
        <div className="space-y-6">
          <Card title="Today's Screen Time Summary">
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Active Screen Time</span>
                <div className="text-3xl font-black text-slate-100 mt-1">
                  {Math.floor(screenTimeMinutes / 60)} hours {screenTimeMinutes % 60} minutes
                </div>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </Card>

          <Card title="App Usage Analytics">
            {isIOSUnavailable ? (
              <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-200 text-sm">App Usage Unavailable on iOS</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Apple iOS operating system restricts third-party access to detailed app package telemetry. Overall screen time tracking remains active.
                </p>
              </div>
            ) : appUsage.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No app usage data reported for today yet.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appUsage}>
                      <XAxis dataKey="appName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="durationMinutes" radius={[8, 8, 0, 0]}>
                        {appUsage.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="divide-y divide-slate-800">
                  {appUsage.map((app, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{app.appName}</span>
                      <span className="font-mono text-indigo-400 font-bold">{app.durationMinutes} mins</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
