import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/reportApi';
import { childrenApi } from '../api/childrenApi';
import { DailyReport, ChildProfile } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { FileText, Download, Calendar, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await childrenApi.getChildren();
      setChildrenList(fetchedChildren);

      if (fetchedChildren.length > 0) {
        const firstId = fetchedChildren[0].id || fetchedChildren[0]._id;
        setSelectedChildId(firstId);
        await fetchReports(firstId);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async (childId: string) => {
    try {
      const [daily, weekly] = await Promise.all([
        reportApi.getDailyReport(childId),
        reportApi.getWeeklyReport(childId),
      ]);
      setDailyReport(daily);
      setWeeklyReport(weekly);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    fetchReports(childId);
  };

  if (isLoading) {
    return <LoadingSpinner label="Generating GuardianX Safety Reports..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Safety & Wellbeing Reports</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated daily and weekly activity summaries powered by GuardianX backend analytics
          </p>
        </div>
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{c.name}'s Report</span>
              </button>
            );
          })}
        </div>
      )}

      {childrenList.length === 0 ? (
        <EmptyState
          title="No Children Profiles Found"
          description="Add a child profile to generate daily and weekly safety reports."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Report Card */}
          <Card title="Daily Safety Report" subtitle={dailyReport?.date || 'Today'}>
            {dailyReport ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Screen Time:</span>
                    <span className="font-bold text-slate-100">{dailyReport.screenTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Ping Count:</span>
                    <span className="font-bold text-slate-100">{dailyReport.locationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alerts Logged:</span>
                    <span className="font-bold text-slate-100">{dailyReport.alertsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safety Score:</span>
                    <span className="font-bold text-indigo-400">{dailyReport.safetyScore}/100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                  {dailyReport.summaryText}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Daily report being compiled by backend.
              </div>
            )}
          </Card>

          {/* Weekly Report Card */}
          <Card title="Weekly Safety Summary" subtitle="Past 7 Days">
            {weeklyReport ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weekly Total Screen Time:</span>
                    <span className="font-bold text-slate-100">{weeklyReport.screenTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location Ping Total:</span>
                    <span className="font-bold text-slate-100">{weeklyReport.locationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weekly Safety Index:</span>
                    <span className="font-bold text-emerald-400">{weeklyReport.safetyScore}/100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                  {weeklyReport.summaryText}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Weekly report requires Premium plan or backend compilation.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
