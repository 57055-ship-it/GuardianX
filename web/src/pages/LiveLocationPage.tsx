import React, { useState, useEffect } from 'react';
import { childrenApi } from '../api/childrenApi';
import { locationApi } from '../api/locationApi';
import { geofenceApi } from '../api/geofenceApi';
import { ChildProfile, LocationRecord, Geofence } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { MapView } from '../components/common/MapView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { MapPin, RefreshCw, Smartphone, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LiveLocationPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [latestLocation, setLatestLocation] = useState<LocationRecord | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationRecord[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [ageSeconds, setAgeSeconds] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedChildren, fetchedGeofences] = await Promise.all([
        childrenApi.getChildren(),
        geofenceApi.getGeofences(),
      ]);
      setChildrenList(fetchedChildren);
      setGeofences(fetchedGeofences);

      if (fetchedChildren.length > 0) {
        const firstId = fetchedChildren[0].id || fetchedChildren[0]._id;
        setSelectedChildId(firstId);
        await loadChildLocation(firstId);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildLocation = async (childId: string) => {
    setIsRefreshing(true);
    try {
      const [locRes, hist] = await Promise.all([
        locationApi.getLatestLocation(childId),
        locationApi.getLocationHistory(childId, 50),
      ]);
      if (locRes) {
        setLatestLocation(locRes);
        const age = Math.floor((Date.now() - new Date(locRes.timestamp).getTime()) / 1000);
        setAgeSeconds(age);
        setIsStale(age > 300);
      } else {
        setLatestLocation(null);
      }
      setLocationHistory(hist);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time interval polling every 10 seconds while Live Location screen is open
  useEffect(() => {
    loadInitialData();

    const intervalId = setInterval(() => {
      if (selectedChildId) {
        loadChildLocation(selectedChildId);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedChildId]);

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    loadChildLocation(childId);
  };

  if (isLoading) {
    return <LoadingSpinner label="Connecting to Real GPS Live Telemetry..." />;
  }

  const selectedChild = childrenList.find((c) => (c.id || c._id) === selectedChildId);
  const center: [number, number] = latestLocation
    ? [latestLocation.latitude, latestLocation.longitude]
    : [33.6844, 73.0479];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Live GPS Location Map</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real GPS satellite coordinates directly transmitted from child hardware sensors (polling every 10s)
          </p>
        </div>

        <Button
          variant="outline"
          icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          onClick={() => selectedChildId && loadChildLocation(selectedChildId)}
          isLoading={isRefreshing}
        >
          Refresh GPS Fix
        </Button>
      </div>

      {/* Child Filter Selector */}
      {childrenList.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {childrenList.map((c) => {
            const cId = c.id || c._id;
            const isSelected = cId === selectedChildId;
            return (
              <button
                key={cId}
                onClick={() => handleChildSelect(cId)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {childrenList.length === 0 ? (
        <EmptyState
          title="No Children Profiles Available"
          description="Add a child profile and pair their device to begin real live GPS tracking."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title={`Live Location: ${selectedChild?.name || ''}`} className="lg:col-span-2 space-y-4">
            {latestLocation ? (
              <>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-slate-200">
                      Lat: {latestLocation.latitude.toFixed(5)}, Lng: {latestLocation.longitude.toFixed(5)}
                    </span>
                    <Badge variant="info" size="sm">
                      Accuracy ±{(latestLocation.accuracy ?? 0).toFixed(1)} m
                    </Badge>
                  </div>

                  <Badge variant={isStale ? 'warning' : 'success'} size="sm">
                    {isStale ? `Stale (${Math.floor(ageSeconds / 60)}m ago)` : `Live (${ageSeconds}s ago)`}
                  </Badge>
                </div>

                <MapView
                  center={center}
                  zoom={15}
                  height="460px"
                  markers={[
                    {
                      id: latestLocation.id || 'curr',
                      latitude: latestLocation.latitude,
                      longitude: latestLocation.longitude,
                      title: `${selectedChild?.name || 'Child'} (Accuracy ±${(latestLocation.accuracy ?? 0).toFixed(1)}m)`,
                      subtitle: `Updated: ${new Date(latestLocation.timestamp).toLocaleTimeString()}`,
                    },
                  ]}
                  circles={[
                    {
                      id: 'accuracy_circle',
                      latitude: latestLocation.latitude,
                      longitude: latestLocation.longitude,
                      radius: Math.max(latestLocation.accuracy ?? 0, 10),
                      name: `GPS Accuracy Range (±${(latestLocation.accuracy ?? 0).toFixed(1)}m)`,
                      type: 'safe',
                    },
                    ...geofences.map((g) => ({
                      id: g.id || g._id,
                      latitude: g.latitude,
                      longitude: g.longitude,
                      radius: g.radius,
                      name: g.name,
                      type: g.type,
                    })),
                  ]}
                />

                {/* Diagnostic Telemetry Panel */}
                <div className="p-4 bg-slate-950/90 border border-indigo-500/30 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-indigo-400 uppercase tracking-wide flex items-center justify-between">
                    <span>GPS Telemetry Diagnostic Debug</span>
                    <span className="text-[10px] text-slate-400 font-mono">API: Production Render API</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300">
                    <div><span className="text-slate-500">Source:</span> GuardianX Child Device</div>
                    <div><span className="text-slate-500">Latitude:</span> {latestLocation.latitude}</div>
                    <div><span className="text-slate-500">Longitude:</span> {latestLocation.longitude}</div>
                    <div><span className="text-slate-500">Accuracy:</span> ±{(latestLocation.accuracy ?? 0).toFixed(1)}m</div>
                    <div><span className="text-slate-500">Last Updated:</span> {new Date(latestLocation.timestamp).toLocaleString()}</div>
                    <div><span className="text-slate-500">Stale State:</span> {isStale ? 'STALE' : 'FRESH'}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-300 text-sm">No Location Fix Available Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Waiting for child's device GPS hardware to lock satellite position and sync telemetry.
                </p>
              </div>
            )}
          </Card>

          <Card title="Recorded Location History" className="lg:col-span-1 space-y-4">
            {locationHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No location history logs recorded yet for this child device.
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {locationHistory.map((loc, idx) => (
                  <div
                    key={loc.id || idx}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <MapPin className="w-3.5 h-3.5" /> Log #{locationHistory.length - idx}
                      </span>
                      <span className="text-slate-500 font-normal">
                        {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] flex justify-between">
                      <span>{loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}</span>
                      <span className="text-slate-500">±{(loc.accuracy ?? 0).toFixed(1)}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
