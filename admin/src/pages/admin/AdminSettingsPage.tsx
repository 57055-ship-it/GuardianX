import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { SaaSSetting } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SaaSSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getSettings();
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, newValue: any) => {
    setSuccessMsg(null);
    try {
      await adminApi.updateSetting(key, newValue);
      setSuccessMsg(`Setting '${key}' updated successfully.`);
      fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update setting.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">SaaS Platform Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Global administrative parameters, registration toggles, and system defaults</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading SaaS settings..." />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          {settings.map((s) => (
            <div key={s._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{s.key}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {typeof s.value === 'boolean' ? (
                  <button
                    onClick={() => handleUpdate(s.key, !s.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      s.value ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {s.value ? 'ENABLED' : 'DISABLED'}
                  </button>
                ) : (
                  <input
                    type="text"
                    defaultValue={String(s.value)}
                    onBlur={(e) => {
                      if (e.target.value !== String(s.value)) {
                        handleUpdate(s.key, e.target.value);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-600 w-full sm:w-48"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

