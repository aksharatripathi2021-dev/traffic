import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Zone, PoliceOfficer, CitizenReport } from '../../types/traffic';
import { getRiskLevel } from '../../utils/riskCalculator';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

// Fix Leaflet default marker icons in React Vite environment
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom Icon Creators
const createZoneIcon = (riskScore: number) => {
  const level = getRiskLevel(riskScore);
  let bg = '#10b981'; // 🟢 Green
  let shadow = 'rgba(16, 185, 129, 0.7)';
  if (level === 'CRITICAL') {
    bg = '#ef4444'; // 🔴 Red
    shadow = 'rgba(239, 68, 68, 0.9)';
  } else if (level === 'HIGH') {
    bg = '#f97316'; // 🟠 Orange
    shadow = 'rgba(249, 115, 22, 0.85)';
  } else if (level === 'MEDIUM') {
    bg = '#f59e0b'; // 🟡 Yellow
    shadow = 'rgba(245, 158, 11, 0.8)';
  }

  return L.divIcon({
    className: 'custom-zone-marker',
    html: `<div style="background-color: ${bg}; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${shadow}, 0 2px 6px rgba(0,0,0,0.5); color: #ffffff; font-weight: 800; font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; cursor: pointer; transition: transform 0.2s ease;">
            ${riskScore}
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createPoliceIcon = () =>
  L.divIcon({
    className: 'custom-police-marker',
    html: `<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 2px 4px rgba(0,0,0,0.4); cursor: pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

const createReportIcon = () =>
  L.divIcon({
    className: 'custom-report-marker',
    html: `<div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8), 0 2px 4px rgba(0,0,0,0.4); cursor: pointer;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
           </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

// Component to dynamically re-center map if selected zone changes
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Smooth Canvas Heatmap Layer Component for Geographic Risk Intensity
interface TrafficHeatmapLayerProps {
  zones: Zone[];
  reports: CitizenReport[];
}

const TrafficHeatmapLayer: React.FC<TrafficHeatmapLayerProps> = ({ zones, reports }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Create or attach canvas to Leaflet's overlayPane (behind interactive markerPane)
    const pane = map.getPane('overlayPane') || map.getPanes().overlayPane;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none'; // Critical: allows all click/drag events to pass through to map & markers
    canvas.style.zIndex = '350';
    canvas.style.opacity = '0.82';
    pane.appendChild(canvas);
    canvasRef.current = canvas;

    // 2. Build 256-color gradient palette: Green (Low) -> Yellow (Medium) -> Orange (High) -> Red (Critical)
    const paletteCanvas = document.createElement('canvas');
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const pctx = paletteCanvas.getContext('2d');
    if (!pctx) return;

    const grad = pctx.createLinearGradient(0, 0, 256, 1);
    grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.2, 'rgba(34, 197, 94, 0.45)');   // 🟢 Green (Low Risk)
    grad.addColorStop(0.45, 'rgba(163, 230, 53, 0.7)');  // Lime / Yellow-Green
    grad.addColorStop(0.65, 'rgba(234, 179, 8, 0.85)');  // 🟡 Yellow (Medium Risk)
    grad.addColorStop(0.82, 'rgba(249, 115, 22, 0.95)'); // 🟠 Orange (High Risk)
    grad.addColorStop(1.0, 'rgba(239, 68, 68, 1.0)');    // 🔴 Red (Critical/Very High Risk)

    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 256, 1);
    const paletteData = pctx.getImageData(0, 0, 256, 1).data;

    // 3. Create radial gradient brush template
    const createBrush = (radius: number, blur: number) => {
      const brush = document.createElement('canvas');
      const size = radius + blur;
      brush.width = size * 2;
      brush.height = size * 2;
      const bctx = brush.getContext('2d')!;
      const rgrad = bctx.createRadialGradient(size, size, radius * 0.1, size, size, size);
      rgrad.addColorStop(0, 'rgba(0,0,0,1)');
      rgrad.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = rgrad;
      bctx.beginPath();
      bctx.arc(size, size, size, 0, Math.PI * 2);
      bctx.fill();
      return { brush, size };
    };

    // 4. Render heat points onto canvas with projection alignment
    const draw = () => {
      if (!canvas || !map) return;

      const size = map.getSize();
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

      canvas.width = size.x;
      canvas.height = size.y;
      L.DomUtil.setPosition(canvas, topLeft);

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, size.x, size.y);

      const zoom = map.getZoom();
      // Scale heat radius smoothly with map zoom
      const baseRadius = Math.max(38, Math.min(130, 32 * Math.pow(1.22, zoom - 11)));
      const blur = baseRadius * 0.65;
      const { brush, size: brushSize } = createBrush(baseRadius, blur);

      // Collect data points from existing zones and citizen reports
      const points: Array<{ lat: number; lng: number; intensity: number }> = [];

      zones.forEach((z) => {
        const intensity = Math.max(0.2, Math.min(1.0, z.riskScore / 100));
        points.push({ lat: z.latitude, lng: z.longitude, intensity });

        // Geographically distribute heat across junction corridors for natural gradient flow
        const spreadOffset = 0.0035;
        points.push({ lat: z.latitude + spreadOffset, lng: z.longitude + spreadOffset, intensity: intensity * 0.7 });
        points.push({ lat: z.latitude - spreadOffset, lng: z.longitude + spreadOffset, intensity: intensity * 0.65 });
        points.push({ lat: z.latitude + spreadOffset, lng: z.longitude - spreadOffset, intensity: intensity * 0.65 });
        points.push({ lat: z.latitude - spreadOffset, lng: z.longitude - spreadOffset, intensity: intensity * 0.7 });
      });

      reports.forEach((r) => {
        let rIntensity = 0.6;
        if (r.incidentType === 'Accident') rIntensity = 0.95;
        else if (r.incidentType === 'Water Logging' || r.incidentType === 'Waterlogging') rIntensity = 0.85;
        else if (r.incidentType === 'Road Blocked') rIntensity = 0.8;
        else if (r.incidentType === 'Heavy Congestion' || r.incidentType === 'Congestion') rIntensity = 0.75;

        points.push({ lat: r.latitude, lng: r.longitude, intensity: rIntensity });
      });

      // Pass 1: Draw alpha density masks
      points.forEach((pt) => {
        if (bounds.contains([pt.lat, pt.lng])) {
          const p = map.latLngToContainerPoint([pt.lat, pt.lng]);
          ctx.globalAlpha = Math.max(0.18, Math.min(0.96, pt.intensity * 0.85));
          ctx.drawImage(brush, p.x - brushSize, p.y - brushSize);
        }
      });

      // Pass 2: Colorize pixels through the Green -> Yellow -> Orange -> Red spectrum
      try {
        const imgData = ctx.getImageData(0, 0, size.x, size.y);
        const data = imgData.data;
        for (let i = 3; i < data.length; i += 4) {
          const alpha = data[i];
          if (alpha > 0) {
            const pIdx = Math.min(255, alpha) * 4;
            data[i - 3] = paletteData[pIdx];     // Red channel
            data[i - 2] = paletteData[pIdx + 1]; // Green channel
            data[i - 1] = paletteData[pIdx + 2]; // Blue channel
            // Keep subtle translucency so underlying street maps and road names remain legible
            data[i] = Math.min(195, Math.floor(alpha * 0.8 + 25));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // Fallback gracefully if canvas manipulation is blocked
      }
    };

    draw();

    map.on('move', draw);
    map.on('zoom', draw);
    map.on('resize', draw);
    map.on('viewreset', draw);

    return () => {
      map.off('move', draw);
      map.off('zoom', draw);
      map.off('resize', draw);
      map.off('viewreset', draw);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, zones, reports]);

  return null;
};

export interface LeafletMapProps {
  zones: Zone[];
  officers?: PoliceOfficer[];
  reports?: CitizenReport[];
  center?: [number, number];
  zoom?: number;
  onSelectZone?: (zoneId: string) => void;
  onDeployRequest?: (zoneId: string) => void;
  height?: string;
  showHeatmap?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  zones,
  officers = [],
  reports = [],
  center = [21.1458, 79.0882], // Default Nagpur center
  zoom = 12,
  onSelectZone,
  onDeployRequest,
  height = '500px',
  showHeatmap = true
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        <MapRecenter center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Real-time Geographic Traffic Risk Heat Map Layer */}
        {showHeatmap && <TrafficHeatmapLayer zones={zones} reports={reports} />}

        {/* Clickable Zone Markers (Positioned on top of Heat Layer) */}
        {zones.map((zone) => {
          const riskCat = getRiskLevel(zone.riskScore);
          return (
            <Marker
              key={`zone-${zone.zoneId}`}
              position={[zone.latitude, zone.longitude]}
              icon={createZoneIcon(zone.riskScore)}
              eventHandlers={{
                click: () => onSelectZone && onSelectZone(zone.zoneId)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 min-w-[230px] bg-slate-900 text-white rounded-lg space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <h4 className="font-extrabold text-sm text-white">{zone.zoneName}</h4>
                    <StatusBadge type="risk" value={riskCat} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Score:</span>
                      <span className="font-bold text-amber-400">{zone.riskScore} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Traffic Level:</span>
                      <StatusBadge type="traffic" value={zone.trafficLevel} size="sm" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Category:</span>
                      <span className="font-semibold text-slate-200">{riskCat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Updated:</span>
                      <span className="text-slate-300 font-medium">{zone.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    {onSelectZone && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectZone(zone.zoneId)}
                        className="w-full text-xs font-bold py-1"
                      >
                        VIEW DETAILS
                      </Button>
                    )}
                    {onDeployRequest && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => onDeployRequest(zone.zoneId)}
                        className="w-full text-xs font-bold py-1"
                      >
                        DEPLOY UNIT
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Police Patrol Markers */}
        {officers.map((officer, index) => {
          const zoneMatch = zones.find((z) => z.zoneId === officer.assignedZoneId);
          const angle = (index * 1.4) + 0.5;
          const dist = 0.0042;
          const lat = zoneMatch ? zoneMatch.latitude - Math.sin(angle) * dist : center[0] + Math.sin(index + 1) * 0.015;
          const lng = zoneMatch ? zoneMatch.longitude - Math.cos(angle) * dist : center[1] + Math.cos(index + 1) * 0.015;

          return (
            <Marker key={`off-${officer.officerId}`} position={[lat, lng]} icon={createPoliceIcon()}>
              <Popup>
                <div className="p-1.5 text-xs text-slate-900 font-sans">
                  <div className="font-bold text-blue-600">{officer.officerName}</div>
                  <div>Rank: {officer.rank}</div>
                  <div>Badge: {officer.badgeNumber}</div>
                  <div>Status: {officer.status}</div>
                  <div>Assigned: {officer.assignedZoneName || 'Unassigned'}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Citizen Incident Hazard Markers */}
        {reports.map((report, index) => {
          const zoneNear = zones.find(z => Math.abs(z.latitude - report.latitude) < 0.002 && Math.abs(z.longitude - report.longitude) < 0.002);
          const angle = (index * 1.8) + 1.2;
          const dist = 0.0038;
          const lat = zoneNear ? report.latitude + Math.sin(angle) * dist : report.latitude;
          const lng = zoneNear ? report.longitude + Math.cos(angle) * dist : report.longitude;

          return (
            <Marker
              key={`rep-${report.reportId}`}
              position={[lat, lng]}
              icon={createReportIcon()}
            >
              <Popup>
                <div className="p-1.5 text-xs text-slate-900 max-w-[200px]">
                  <div className="font-bold text-red-600 mb-0.5">{report.incidentType}</div>
                  <p className="text-slate-600 line-clamp-2">{report.description}</p>
                  <div className="mt-1 text-[10px] text-slate-500">{report.location} • {report.time}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
