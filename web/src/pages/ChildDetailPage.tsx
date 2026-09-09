import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { childrenApi } from '../api/childrenApi';
import { locationApi } from '../api/locationApi';
import { usageApi } from '../api/usageApi';
import { sosApi } from '../api/sosApi';
import { analyticsApi } from '../api/analyticsApi';
import { geofenceApi } from '../api/geofenceApi';
import {
  ChildProfile,
  LocationRecord,
  AppUsageItem,
  SOSEvent,
  SafetyInsights,
  Geofence,
} from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { MapView } from '../components/common/MapView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  User as UserIcon,
  MapPin,
  Smartphone,
  ShieldAlert,
  Bell,
  Clock,
  AlertTriangle,
  Activity,
  ArrowLeft,
} from 'lucide-react';

export const ChildDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [latestLocation, setLatestLocation] = useState<LocationRecord | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationRecord[]>([]);
  const [screenTimeMinutes, setScreenTimeMinutes] = useState<number>(0);
  const [appUsage, setAppUsage] = useState<AppUsageItem[]>([]);
  const [isIOSUnavailable, setIsIOSUnavailable] = useState<boolean>(false);
  const [sosEvents, setSOSEvents] = useState<SOSEvent[]>([]);
  const [insights, setInsights] = useState<SafetyInsights | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'location' | 'wellbeing' | 'geofences' | 'alerts' | 'safety'
  >('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const childData = await childrenApi.getChildById(id);
      setChild(childData);

      const [loc, locHist, usageData, appData, sosData, insightsData, geofenceData] =
        await Promise.all([
          locationApi.getLatestLocation(id).catch(() => null),
          locationApi.getLocationHistory(id, 20).catch(() => []),
          usageApi.getScreenTime(id).catch(() => ({ totalScreenTimeMinutes: 0, date: '' })),
          usageApi.getAppUsage(id).catch(() => ({ appUsage: [], isIOSUnavailable: true })),
          sosApi.getSOSEvents(id).catch(() => []),
          analyticsApi.getSafetyInsights(id).catch(() => null),
          geofenceApi.getGeofences().catch(() => []),
        ]);

      setLatestLocation(loc);
      setLocationHistory(locHist);
      setScreenTimeMinutes(usageData.totalScreenTimeMinutes);
      setAppUsage(appData.appUsage);
      setIsIOSUnavailable(appData.isIOSUnavailable || false);
      setSOSEvents(sosData);
      setInsights(insightsData);
      setGeofences(geofenceData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load child details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChildData();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner label="Fetching child profile & real-time telemetry..." />;
  }

  if (error || !child) {
    return (
      <div className="space-y-4">
        <Link to="/family">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Family
          </Button>
        </Link>
        <EmptyState
          title="Child Profile Not Found"
          description={error || 'Unable to fetch child profile.'}
        />
      </div>
    );
  }

  const mapCenter: [number, number] = latestLocation
    ? [latestLocation.latitude, latestLocation.longitude]
    : [33.6844, 73.0479];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Profile Header */}
      <div className="flex items-center gap-3">
        <Link to="/family">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Family
          </Button>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-2xl">
            {child.name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{child.name}</h1>
              <Badge variant={child.profileStatus === 'paired' ? 'success' : 'warning'}>
                {child.profileStatus === 'paired' ? 'Paired' : 'Unpaired'}
              </Badge>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-4">
              <span>Device: {child.device?.deviceName || 'None'}</span>
              {child.device && (
                <>
                  <span>Platform: {child.device.platform.toUpperCase()}</span>
                  <span>Battery: {child.device.batteryLevel}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        {insights && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Safety Score</div>
              <div className="text-2xl font-black text-slate-100">{insights.safetyScore}/100</div>
              <div className="text-xs text-emerald-400 font-bold">{insights.level} Safety</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: UserIcon },
          { key: 'location', label: 'Live Location & History', icon: MapPin },
          { key: 'wellbeing', label: 'Digital Wellbeing', icon: Smartphone },
          { key: 'geofences', label: 'Safe Zones', icon: ShieldAlert },
          { key: 'alerts', label: `SOS & Alerts (${sosEvents.length})`, icon: Bell },
          { key: 'safety', label: 'Safety Score Breakdown', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Device Status" className="lg:col-span-1 space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Device Model:</span>
                <span className="font-semibold text-slate-200">{child.device?.deviceName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Battery Level:</span>
                <span className="font-semibold text-slate-200">{child.device?.batteryLevel ?? 'N/A'}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Online Status:</span>
                <Badge variant={child.device?.isOnline ? 'success' : 'neutral'} size="sm">
                  {child.device?.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Last Telemetry:</span>
                <span className="font-semibold text-slate-200">
                  {child.device?.lastSeen
                    ? new Date(child.device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Quick Telemetry Summary" className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Today Screen Time</div>
                <div className="text-xl font-bold text-slate-100 mt-1">
                  {Math.floor(screenTimeMinutes / 60)}h {screenTimeMinutes % 60}m
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Active Emergency SOS</div>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {sosEvents.filter((s) => s.status === 'active').length}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Current Location Fix</h4>
              {latestLocation ? (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-indigo-400 flex items-center justify-between">
                    <span>Lat: {latestLocation.latitude.toFixed(4)}, Lng: {latestLocation.longitude.toFixed(4)}</span>
                    <Badge variant="info" size="sm">Accuracy ±{(latestLocation.accuracy ?? 0).toFixed(1)}m</Badge>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Updated: {new Date(latestLocation.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500 text-center">
                  No GPS coordinates recorded yet for this child device.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: LOCATION */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <Card title="Live Map View & Safe Zones">
            <MapView
              center={mapCenter}
              zoom={14}
              height="450px"
              markers={
                latestLocation
                  ? [
                      {
                        id: latestLocation.id || 'curr',
                        latitude: latestLocation.latitude,
                        longitude: latestLocation.longitude,
                        title: `${child.name} (Accuracy ±${(latestLocation.accuracy ?? 0).toFixed(1)}m)`,
                        subtitle: `Last updated ${new Date(latestLocation.timestamp).toLocaleTimeString()}`,
                      },
                    ]
                  : []
              }
              circles={[
                ...(latestLocation
                  ? [
                      {
                        id: 'acc',
                        latitude: latestLocation.latitude,
                        longitude: latestLocation.longitude,
                        radius: Math.max(latestLocation.accuracy ?? 10, 10),
                        name: `GPS Accuracy Range (±${(latestLocation.accuracy ?? 0).toFixed(1)}m)`,
                        type: 'safe' as const,
                      },
                    ]
                  : []),
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
          </Card>

          <Card title="Recent Location History Breadcrumbs">
            {locationHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No location history breadcrumbs recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {locationHistory.map((loc, index) => (
                  <div
                    key={loc.id || index}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-200">
                          {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                        </span>
                        <span className="text-slate-500 text-[11px] ml-2">(±{(loc.accuracy ?? 0).toFixed(1)}m)</span>
                      </div>
                    </div>
                    <span className="text-slate-500">
                      {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: DIGITAL WELLBEING */}
      {activeTab === 'wellbeing' && (
        <div className="space-y-6">
          <Card title="Screen Time Overview">
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Today Screen Time</span>
                <div className="text-3xl font-black text-slate-100 mt-1">
                  {Math.floor(screenTimeMinutes / 60)} hours {screenTimeMinutes % 60} minutes
                </div>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </Card>

          <Card title="App Usage Breakdown">
            {isIOSUnavailable ? (
              <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                <Smartphone className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-300 text-sm">App Usage Data Unavailable on iOS</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Apple iOS privacy guidelines restrict background app usage access. Screen time tracking remains active for summary telemetry.
                </p>
              </div>
            ) : appUsage.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No app usage data recorded today.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {appUsage.map((app, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{app.appName}</span>
                    <span className="font-mono text-indigo-400">{app.durationMinutes} mins</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: GEOFENCES */}
      {activeTab === 'geofences' && (
        <Card title="Configured Safe Zones">
          {geofences.length === 0 ? (
            <EmptyState
              title="No Safe Zones Configured"
              description="Create safe zones to receive automatic alerts when your child enters or leaves specific locations."
              action={
                <Link to="/safe-zones">
                  <Button variant="primary">Manage Safe Zones</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geofences.map((g) => (
                <div key={g.id || g._id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{g.name}</span>
                    <Badge variant={g.type === 'danger' ? 'danger' : 'success'}>
                      {g.type === 'danger' ? 'Danger Zone' : 'Safe Zone'}
                    </Badge>
                  </div>
                  <div className="text-slate-400">Radius: {g.radius} meters</div>
                  <div className="text-slate-500 text-[11px]">
                    Lat: {g.latitude.toFixed(4)}, Lng: {g.longitude.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: ALERTS */}
      {activeTab === 'alerts' && (
        <Card title="Emergency SOS Events & Alerts">
          {sosEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No emergency SOS events triggered for this child.
            </div>
          ) : (
            <div className="space-y-3">
              {sosEvents.map((sos) => (
                <div
                  key={sos.id || sos._id}
                  className="p-4 bg-slate-950 border border-rose-500/30 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-rose-400 text-sm">Emergency SOS Triggered!</div>
                      <div className="text-xs text-slate-400">
                        Lat: {sos.latitude.toFixed(4)}, Lng: {sos.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={sos.status === 'resolved' ? 'success' : 'danger'}>
                      {sos.status}
                    </Badge>
                    {sos.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          await sosApi.resolveSOSEvent(sos.id || sos._id);
                          loadChildData();
                        }}
                      >
                        Resolve SOS
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 6: SAFETY SCORE */}
      {activeTab === 'safety' && (
        <Card title="Explainable Safety Insights & Factors">
          {insights ? (
            <div className="space-y-6">
              <div className="p-6 bg-slate-950/80 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Overall Safety Score</div>
                  <div className="text-4xl font-black text-slate-100 mt-1">{insights.safetyScore}/100</div>
                  <p className="text-xs text-indigo-400 mt-1">Classification: {insights.level}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Evaluated Safety Factors</h4>
                {insights.factors?.map((f, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{f.category}</div>
                      <div className="text-slate-400 text-[11px]">{f.detail}</div>
                    </div>
                    <span className="font-bold text-indigo-400">{f.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              Safety score evaluation currently loading or unavailable.
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
