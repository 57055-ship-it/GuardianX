import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Plan } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PackageCheck, Plus, Edit2, Check, X, Shield, Sparkles } from 'lucide-react';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Partial<Plan> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPlans();
      setPlans(res.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!selectedPlan || !selectedPlan.name || !selectedPlan.slug) return;
    setIsSaving(true);
    try {
      if (selectedPlan._id || selectedPlan.id) {
        await adminApi.updatePlan(selectedPlan._id || (selectedPlan.id as string), selectedPlan);
      } else {
        await adminApi.createPlan(selectedPlan);
      }
      setSelectedPlan(null);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">SaaS Plan Management</h1>
          <p className="text-sm text-slate-400 mt-1">Configure pricing, resource limits, and feature entitlements for all tiers</p>
        </div>
        <Button
          onClick={() =>
            setSelectedPlan({
              name: '',
              slug: '',
              description: '',
              price: 0,
              currency: 'USD',
              billingInterval: 'monthly',
              trialDays: 14,
              active: true,
              limits: {
                maxChildren: 1,
                maxDevices: 2,
                maxParents: 2,
                maxSafeZones: 2,
                locationHistoryDays: 7,
                maxLocationUpdates: 1000,
                maxReportsPerMonth: 10
              },
              features: {
                screenTimeEnabled: true,
                appUsageEnabled: true,
                locationEnabled: true,
                locationHistoryEnabled: false,
                safeZonesEnabled: true,
                sosEnabled: true,
                reportsEnabled: true,
                advancedReportsEnabled: false,
                familyRoutineEnabled: true,
                notificationsEnabled: true
              }
            })
          }
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Loading SaaS plans..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-amber-400">{p.slug}</span>
                  <button
                    onClick={() => setSelectedPlan(p)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                </div>

                <div className="text-2xl font-extrabold text-slate-100">
                  {p.price > 0 ? `$${p.price}` : 'Free'}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {p.billingInterval}</span>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Max Children</span>
                    <span className="font-bold text-amber-400">{p.limits?.maxChildren}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Max Devices</span>
                    <span className="font-semibold text-slate-200">{p.limits?.maxDevices}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Max Safe Zones</span>
                    <span className="font-semibold text-slate-200">{p.limits?.maxSafeZones}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Location History</span>
                    <span className="font-semibold text-slate-200">{p.features?.locationHistoryEnabled ? `${p.limits?.locationHistoryDays} Days` : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Advanced Reports</span>
                    <span className="font-semibold text-slate-200">{p.features?.advancedReportsEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">{p.trialDays} Days Trial</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  p.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Edit Modal */}
      {selectedPlan && (
        <Modal isOpen={true} onClose={() => setSelectedPlan(null)} title={selectedPlan._id ? `Edit Plan: ${selectedPlan.name}` : 'Create New SaaS Plan'}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={selectedPlan.name || ''}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                  placeholder="e.g. Family Plus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Slug Key</label>
                <input
                  type="text"
                  value={selectedPlan.slug || ''}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, slug: e.target.value.toLowerCase() })}
                  placeholder="e.g. family-plus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={selectedPlan.price ?? 0}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Max Children Limit</label>
                <input
                  type="number"
                  value={selectedPlan.limits?.maxChildren ?? 1}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      limits: { ...selectedPlan.limits!, maxChildren: parseInt(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-bold text-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Max Safe Zones</label>
                <input
                  type="number"
                  value={selectedPlan.limits?.maxSafeZones ?? 2}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      limits: { ...selectedPlan.limits!, maxSafeZones: parseInt(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Max Devices</label>
                <input
                  type="number"
                  value={selectedPlan.limits?.maxDevices ?? 2}
                  onChange={(e) =>
                    setSelectedPlan({
                      ...selectedPlan,
                      limits: { ...selectedPlan.limits!, maxDevices: parseInt(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <span className="block text-xs font-semibold uppercase text-slate-400 mb-2">Feature Toggles</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlan.features?.locationHistoryEnabled ?? false}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        features: { ...selectedPlan.features!, locationHistoryEnabled: e.target.checked }
                      })
                    }
                  />
                  <span>Location History</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlan.features?.advancedReportsEnabled ?? false}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        features: { ...selectedPlan.features!, advancedReportsEnabled: e.target.checked }
                      })
                    }
                  />
                  <span>Advanced Reports</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedPlan(null)}>
                Cancel
              </Button>
              <Button isLoading={isSaving} onClick={handleSavePlan} className="bg-amber-500 text-slate-950 font-bold">
                Save Plan Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
