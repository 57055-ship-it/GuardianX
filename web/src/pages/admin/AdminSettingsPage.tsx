import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { SaaSSetting } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SaaSSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getSettings();
      setSettings(res.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (key: string, newValue: any) => {
    setIsSavingKey(key);
    setSuccessMsg(null);
    try {
      await adminApi.updateSetting(key, newValue);
      setSuccessMsg(`Setting '${key}' updated successfully.`);
      fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update setting.');
    } finally {
      setIsSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">SaaS Platform Configuration</h1>
        <p className="text-sm text-slate-400 mt-1">Global administrative parameters, registration toggles, and system defaults</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading SaaS settings..." />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {settings.map((s) => (
            <div key={s._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 last:border-0 last:pb-0">
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{s.key}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {typeof s.value === 'boolean' ? (
                  <button
                    onClick={() => handleUpdate(s.key, !s.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      s.value ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
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
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 w-full sm:w-48"
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
