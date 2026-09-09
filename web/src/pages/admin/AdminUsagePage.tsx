import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BarChart3, Baby, Shield, Smartphone } from 'lucide-react';

export const AdminUsagePage: React.FC = () => {
  const [usageList, setUsageList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPlatformUsage();
      setUsageList(res.usage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Platform Resource Usage</h1>
        <p className="text-sm text-slate-400 mt-1">Resource consumption metrics vs plan entitlement limits per family</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Calculating platform resource consumption..." />
        </div>
      ) : usageList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
          No active tenant resource consumption records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageList.map((item) => {
            const childPercent = Math.min(100, Math.round((item.children.count / item.children.max) * 100));
            const safeZonePercent = Math.min(100, Math.round((item.safeZones.count / item.safeZones.max) * 100));
            const devicePercent = Math.min(100, Math.round((item.devices.count / item.devices.max) * 100));

            return (
              <div key={item.parentId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{item.parentName}</h3>
                    <p className="text-xs text-slate-400">{item.parentEmail}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    {item.plan}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Children Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-pink-400" /> Children Profiles
                      </span>
                      <span className="font-bold text-slate-100">{item.children.count} / {item.children.max}</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${childPercent >= 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${childPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Safe Zones Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" /> Safe Zones (Geofences)
                      </span>
                      <span className="font-bold text-slate-100">{item.safeZones.count} / {item.safeZones.max}</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${safeZonePercent >= 100 ? 'bg-rose-500' : 'bg-sky-500'}`}
                        style={{ width: `${safeZonePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Devices Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Connected Devices
                      </span>
                      <span className="font-bold text-slate-100">{item.devices.count} / {item.devices.max}</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${devicePercent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${devicePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
