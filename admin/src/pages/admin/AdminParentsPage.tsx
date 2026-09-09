import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Search, Eye, ShieldAlert, PackageCheck, AlertCircle } from 'lucide-react';

export const AdminParentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Plan Assignment Modal state
  const [selectedParentForPlan, setSelectedParentForPlan] = useState<any>(null);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('free');
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);

  // Suspension Modal state
  const [selectedParentForSuspend, setSelectedParentForSuspend] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isTogglingSuspend, setIsTogglingSuspend] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchParents(1);
    fetchPlans();
  }, [search, statusFilter]);

  const fetchParents = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await adminApi.getParents({ page, limit: 10, search, status: statusFilter });
      setParents(data.parents);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await adminApi.getPlans();
      setPlansList(data.plans);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedParentForPlan) return;
    setIsAssigningPlan(true);
    try {
      await adminApi.assignPlan(selectedParentForPlan._id || selectedParentForPlan.id, selectedPlanSlug);
      setFeedbackMessage(`Plan '${selectedPlanSlug.toUpperCase()}' assigned successfully.`);
      setSelectedParentForPlan(null);
      fetchParents(pagination.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign plan.');
    } finally {
      setIsAssigningPlan(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!selectedParentForSuspend) return;
    setIsTogglingSuspend(true);
    const isCurrentlyActive = selectedParentForSuspend.isActive;
    try {
      await adminApi.toggleSuspension(
        selectedParentForSuspend._id || selectedParentForSuspend.id,
        isCurrentlyActive, // suspend if currently active
        suspendReason
      );
      setFeedbackMessage(
        `Parent account ${isCurrentlyActive ? 'suspended' : 'reactivated'} successfully.`
      );
      setSelectedParentForSuspend(null);
      fetchParents(pagination.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setIsTogglingSuspend(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Parents Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Manage GuardianX parent accounts, subscriptions, and limits</p>
      </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Controls / Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parent name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-600 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading parents database..." />
          </div>
        ) : parents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No parent accounts found matching your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Family / Plan</th>
                  <th className="px-6 py-4">Children / Devices</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800">{p.tenantId?.name || 'Family'}</div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <div className="font-bold text-slate-900">{p.childrenCount} Children</div>
                      <div className="text-slate-500">{p.devicesCount} Devices</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/parents/${p._id || p.id}`)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedParentForPlan(p);
                          setSelectedPlanSlug((p.plan || 'FREE').toLowerCase());
                        }}
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer"
                        title="Assign Plan"
                      >
                        <PackageCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedParentForSuspend(p)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          p.isActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                        title={p.isActive ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Plan Modal */}
      {selectedParentForPlan && (
        <Modal isOpen={true} onClose={() => setSelectedParentForPlan(null)} title="Assign SaaS Plan">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Select a plan to assign to <strong className="text-slate-900">{selectedParentForPlan.email}</strong>.
            </p>

            <select
              value={selectedPlanSlug}
              onChange={(e) => setSelectedPlanSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
            >
              {plansList.map((plan) => (
                <option key={plan.slug} value={plan.slug}>
                  {plan.name} ({plan.price > 0 ? `$${plan.price}/mo` : 'Free'}) - Max {plan.limits?.maxChildren} Children
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setSelectedParentForPlan(null)}>
                Cancel
              </Button>
              <Button isLoading={isAssigningPlan} onClick={handleAssignPlan} className="bg-amber-600 text-white font-bold">
                Assign Plan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspension Confirmation Modal */}
      {selectedParentForSuspend && (
        <Modal isOpen={true} onClose={() => setSelectedParentForSuspend(null)} title={selectedParentForSuspend.isActive ? 'Suspend Parent Account' : 'Reactivate Parent Account'}>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                {selectedParentForSuspend.isActive
                  ? 'Suspended parents will be blocked from accessing Parent Portal and mobile API features.'
                  : 'Reactivating will restore application functionality for this parent.'}
              </span>
            </div>

            {selectedParentForSuspend.isActive && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Reason for Suspension</label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms violation or requested deactivation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setSelectedParentForSuspend(null)}>
                Cancel
              </Button>
              <Button
                isLoading={isTogglingSuspend}
                onClick={handleToggleSuspension}
                className={selectedParentForSuspend.isActive ? 'bg-rose-500 text-white font-bold' : 'bg-emerald-500 text-slate-950 font-bold'}
              >
                {selectedParentForSuspend.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
