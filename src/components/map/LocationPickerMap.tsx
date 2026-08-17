import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

const pinIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(239, 68, 68, 0.9);">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const MapEventsHandler: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  initialLat = 21.1458,
  initialLng = 79.0882,
  onLocationSelect,
  height = '280px'
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-md" style={{ height }}>
      <MapContainer
        center={position}
        zoom={13}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onSelect={handleSelect} />
        <Marker position={position} icon={pinIcon} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex justify-between items-center shadow-lg">
        <span>📍 Click map to pick incident location</span>
        <span className="font-mono text-blue-400 font-semibold">
          {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </span>
      </div>
    </div>
  );
};
