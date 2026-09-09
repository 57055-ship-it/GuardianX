import React, { useState, useEffect } from 'react';
import { geofenceApi } from '../api/geofenceApi';
import { Geofence } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { MapView } from '../components/common/MapView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ShieldAlert, Plus, Trash2, MapPin } from 'lucide-react';

export const SafeZonesPage: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Geofence Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('33.6844');
  const [longitude, setLongitude] = useState<string>('73.0479');
  const [radius, setRadius] = useState<string>('500');
  const [type, setType] = useState<'safe' | 'danger'>('safe');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadGeofences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await geofenceApi.getGeofences();
      setGeofences(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load geofences.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGeofences();
  }, []);

  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (!name.trim() || isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      alert('Please fill in valid name, coordinates, and radius.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await geofenceApi.createGeofence({
        name: name.trim(),
        latitude: lat,
        longitude: lng,
        radius: rad,
        type,
      });
      setGeofences((prev) => [...prev, created]);
      setName('');
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create safe zone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGeofence = async (id: string, zoneName: string) => {
    if (!window.confirm(`Are you sure you want to delete safe zone "${zoneName}"?`)) return;
    try {
      await geofenceApi.deleteGeofence(id);
      setGeofences((prev) => prev.filter((g) => (g.id || g._id) !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete safe zone.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading GuardianX Geofence Safe Zones..." />;
  }

  const mapCenter: [number, number] = geofences.length > 0
    ? [geofences[0].latitude, geofences[0].longitude]
    : [33.6844, 73.0479];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Safe Zones & Geofences</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Define virtual boundaries around home, school, or dangerous areas to receive automated arrival/exit alerts
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Safe Zone
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Map Overview of all Geofences */}
      {geofences.length > 0 && (
        <Card title="Safe Zones Visualizer Map">
          <MapView
            center={mapCenter}
            zoom={12}
            height="400px"
            circles={geofences.map((g) => ({
              id: g.id || g._id,
              latitude: g.latitude,
              longitude: g.longitude,
              radius: g.radius,
              name: g.name,
              type: g.type,
            }))}
          />
        </Card>
      )}

      {/* Geofences List */}
      {geofences.length === 0 ? (
        <EmptyState
          title="No Safe Zones Configured"
          description="Create your first geofence boundary to monitor when children enter or exit safe areas."
          action={
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
              Create First Safe Zone
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {geofences.map((g) => {
            const gId = g.id || g._id;
            return (
              <Card key={gId} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${g.type === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{g.name}</h3>
                      <div className="mt-0.5">
                        <Badge variant={g.type === 'danger' ? 'danger' : 'success'} size="sm">
                          {g.type === 'danger' ? 'Danger Zone' : 'Safe Boundary'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGeofence(gId, g.name)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Radius:</span>
                    <span className="font-bold text-slate-200">{g.radius} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono text-indigo-400">{g.latitude.toFixed(4)}, {g.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Safe Zone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Safe Zone Geofence"
      >
        <form onSubmit={handleCreateGeofence} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Zone Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home, School, Grandparents"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Radius (Meters) *
              </label>
              <input
                type="number"
                required
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Zone Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'safe' | 'danger')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="safe">Safe Area</option>
                <option value="danger">Danger Zone</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Safe Zone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
