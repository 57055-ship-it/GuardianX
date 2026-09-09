import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icon path issue in Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    subtitle?: string;
  }>;
  circles?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
    name: string;
    type?: 'safe' | 'danger';
  }>;
  height?: string;
}

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  markers = [],
  circles = [],
  height = '400px',
}) => {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <strong className="block text-sm font-bold">{m.title}</strong>
                {m.subtitle && <span className="text-xs text-slate-600">{m.subtitle}</span>}
              </div>
            </Popup>
          </Marker>
        ))}
        {circles.map((c) => (
          <Circle
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={c.radius}
            pathOptions={{
              color: c.type === 'danger' ? '#ef4444' : '#10b981',
              fillColor: c.type === 'danger' ? '#ef4444' : '#10b981',
              fillOpacity: 0.2,
            }}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <strong className="block text-sm font-bold">{c.name}</strong>
                <span className="text-xs text-slate-600">Radius: {c.radius}m ({c.type === 'danger' ? 'Danger Zone' : 'Safe Zone'})</span>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};
