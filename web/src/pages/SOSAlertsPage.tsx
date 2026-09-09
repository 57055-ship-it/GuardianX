import React, { useState, useEffect } from 'react';
import { alertApi } from '../api/alertApi';
import { sosApi } from '../api/sosApi';
import { Alert, SOSEvent } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { AlertTriangle, Bell, Check, MapPin } from 'lucide-react';

export const SOSAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sosList, setSOSList] = useState<SOSEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAlertsData = async () => {
    setIsLoading(true);
    try {
      const fetchedAlerts = await alertApi.getAlerts();
      setAlerts(fetchedAlerts);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      await alertApi.markAsRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => ((a.id || a._id) === alertId ? { ...a, isRead: true } : a))
      );
    } catch {
      // Ignore
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading GuardianX Emergency SOS & Alerts..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100">SOS Panic & Safety Alerts</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-priority emergency alerts and automated family safety notifications
        </p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="All Clear — No Active Alerts"
          description="Your family accounts currently have no emergency SOS triggers or unhandled notifications."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const aId = alert.id || alert._id;
            return (
              <Card key={aId} className="hover:border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl border shrink-0 ${
                        alert.type === 'sos' || alert.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : alert.severity === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {alert.type === 'sos' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <Bell className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-base">{alert.title}</h3>
                        <Badge
                          variant={
                            alert.severity === 'critical' || alert.type === 'sos'
                              ? 'danger'
                              : alert.severity === 'high'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                      <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.childName && <span>• Child: {alert.childName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.isRead && (
                      <Button variant="ghost" size="sm" icon={<Check className="w-4 h-4" />} onClick={() => handleMarkRead(aId)}>
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
