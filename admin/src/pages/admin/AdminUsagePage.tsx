import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Baby, Shield, Smartphone } from 'lucide-react';

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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Resource Usage</h1>
        <p className="text-sm text-slate-500 mt-1">Resource consumption metrics vs plan entitlement limits per family</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Calculating platform resource consumption..." />
        </div>
      ) : usageList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm bg-white border border-slate-200 rounded-2xl shadow-xs">
          No active tenant resource consumption records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageList.map((item) => {
            const childPercent = Math.min(100, Math.round((item.children.count / item.children.max) * 100));
            const safeZonePercent = Math.min(100, Math.round((item.safeZones.count / item.safeZones.max) * 100));
            const devicePercent = Math.min(100, Math.round((item.devices.count / item.devices.max) * 100));

            return (
              <div key={item.parentId} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.parentName}</h3>
                    <p className="text-xs text-slate-500">{item.parentEmail}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    {item.plan}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Children Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 font-bold flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-teal-600" /> Children Profiles
                      </span>
                      <span className="font-black text-slate-900">{item.children.count} / {item.children.max}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${childPercent >= 100 ? 'bg-rose-600' : 'bg-teal-600'}`}
                        style={{ width: `${childPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Safe Zones Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 font-bold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" /> Safe Zones (Geofences)
                      </span>
                      <span className="font-black text-slate-900">{item.safeZones.count} / {item.safeZones.max}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${safeZonePercent >= 100 ? 'bg-rose-600' : 'bg-emerald-600'}`}
                        style={{ width: `${safeZonePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Devices Limit */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 font-bold flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-600" /> Connected Devices
                      </span>
                      <span className="font-black text-slate-900">{item.devices.count} / {item.devices.max}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${devicePercent >= 100 ? 'bg-rose-600' : 'bg-amber-600'}`}
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
