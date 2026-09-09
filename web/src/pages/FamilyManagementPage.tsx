import React, { useState, useEffect } from 'react';
import { childrenApi } from '../api/childrenApi';
import { pairingApi } from '../api/pairingApi';
import { familyApi } from '../api/familyApi';
import { ChildProfile, PairingCode, Tenant } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { QRCodeDisplay } from '../components/common/QRCodeDisplay';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Plus,
  QrCode,
  Copy,
  Check,
  Trash2,
  Smartphone,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const FamilyManagementPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [family, setFamily] = useState<Tenant | null>(null);
  const [childrenLimit, setChildrenLimit] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Child Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newChildName, setNewChildName] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Pairing Modal State
  const [pairingModalChild, setPairingModalChild] = useState<ChildProfile | null>(null);
  const [generatedPairingCode, setGeneratedPairingCode] = useState<PairingCode | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadFamilyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedChildren, familyRes] = await Promise.all([
        childrenApi.getChildren(),
        familyApi.getFamilyDetails().catch(() => null),
      ]);
      setChildrenList(fetchedChildren);
      if (familyRes) {
        setFamily(familyRes.family);
        setChildrenLimit(familyRes.family.childrenLimit || 1);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load family management data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyData();
  }, []);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    setIsAdding(true);
    try {
      const createdChild = await childrenApi.createChild(newChildName.trim());
      setChildrenList((prev) => [...prev, createdChild]);
      setNewChildName('');
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add child profile.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleGeneratePairingCode = async (child: ChildProfile) => {
    setPairingModalChild(child);
    setIsGeneratingCode(true);
    setGeneratedPairingCode(null);
    setCopied(false);

    try {
      const pCode = await pairingApi.createPairingCode(child.id || child._id);
      setGeneratedPairingCode(pCode);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate pairing code.');
      setPairingModalChild(null);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleDeleteChild = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your family?`)) return;
    try {
      await childrenApi.deleteChild(id);
      setChildrenList((prev) => prev.filter((c) => (c.id || c._id) !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete child profile.');
    }
  };

  const handleCopyCode = () => {
    if (generatedPairingCode) {
      navigator.clipboard.writeText(generatedPairingCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading GuardianX Family Profiles..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Family Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Household: <span className="text-indigo-400 font-bold">{family?.name}</span> | Capacity:{' '}
            <span className="text-slate-200 font-semibold">{childrenList.length} of {childrenLimit} children slots used</span>
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          disabled={childrenList.length >= childrenLimit}
        >
          Add Child Profile
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-sm text-rose-400">
          {error}
        </div>
      )}

      {childrenList.length === 0 ? (
        <EmptyState
          title="No Children Added Yet"
          description="Create your child's profile to generate a secure 6-character pairing code or QR code to link their device."
          action={
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
              Add Child Profile
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {childrenList.map((child) => {
            const childId = child.id || child._id;
            return (
              <Card key={childId} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-xl">
                      {child.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{child.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={child.profileStatus === 'paired' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {child.profileStatus === 'paired' ? 'Paired' : 'Unpaired'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteChild(childId, child.name)}
                    title="Delete Child Profile"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Device Name:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {child.device?.deviceName || 'Not paired'}
                    </span>
                  </div>

                  {child.device && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Platform & Battery:
                      </span>
                      <span className="font-semibold text-slate-200 uppercase">
                        {child.device.platform} ({child.device.batteryLevel}%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<QrCode className="w-4 h-4 text-indigo-400" />}
                    onClick={() => handleGeneratePairingCode(child)}
                  >
                    {child.profileStatus === 'paired' ? 'Re-Pair Device' : 'Generate Pairing Code'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Child Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Child Profile"
      >
        <form onSubmit={handleCreateChild} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Child's Display Name *
            </label>
            <input
              type="text"
              required
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="e.g. Ali, Sara, Alex"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isAdding}>
              Create Child Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pairing Code & QR Code Modal */}
      <Modal
        isOpen={!!pairingModalChild}
        onClose={() => setPairingModalChild(null)}
        title={`Device Pairing Code: ${pairingModalChild?.name || ''}`}
        maxWidth="md"
      >
        {isGeneratingCode ? (
          <LoadingSpinner label="Generating 15-minute secure pairing code..." />
        ) : generatedPairingCode ? (
          <div className="space-y-6 text-center">
            <p className="text-xs text-slate-400">
              Enter this single-use code in GuardianX Mobile on your child's phone, or scan the QR code below.
            </p>

            {/* Code Banner */}
            <div className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-4 flex items-center justify-center gap-4">
              <span className="font-mono text-3xl font-black text-indigo-400 tracking-widest">
                {generatedPairingCode.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                title="Copy Pairing Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center my-4">
              <QRCodeDisplay value={generatedPairingCode.code} size={180} />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Expires at{' '}
                {new Date(generatedPairingCode.expiresAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                (15 mins TTL)
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full" onClick={() => setPairingModalChild(null)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
