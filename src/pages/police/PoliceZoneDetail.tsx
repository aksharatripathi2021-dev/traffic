import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../hooks/useMockData';
import { LeafletMap } from '../../components/map/LeafletMap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskIndicator } from '../../components/common/RiskIndicator';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DeploymentModal } from '../../components/police/DeploymentModal';
import { IncidentReportCard } from '../../components/citizen/IncidentReportCard';
import { getRiskLevel } from '../../utils/riskCalculator';
import {
  ArrowLeft,
  AlertTriangle,
  CloudRain,
  MapPin,
  Clock,
  Zap,
  Users
} from 'lucide-react';

export const PoliceZoneDetail: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();
  const { zones, officers, reports, deployOfficer, updateReportStatus } = useMockData();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const zone = zones.find((z) => z.zoneId === zoneId) || zones[0];
  const riskLevel = getRiskLevel(zone.riskScore);

  const assignedOfficers = officers.filter((o) => o.assignedZoneId === zone.zoneId);

  const zoneReports = reports.filter(
    (r) => r.location.toLowerCase().includes(zone.zoneName.toLowerCase()) || r.latitude === zone.latitude
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/police/dashboard')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Command Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Zone ID:</span>
          <span className="font-mono text-xs text-amber-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
            {zone.zoneId}
          </span>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge type="risk" value={riskLevel} size="md" pulse={riskLevel === 'CRITICAL'} />
            <StatusBadge type="traffic" value={zone.trafficLevel} size="md" />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              {zone.rainfallCondition}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white">{zone.zoneName} Tactical Overview</h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {zone.latitude.toFixed(4)}° N, {zone.longitude.toFixed(4)}° E
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Updated {zone.lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="warning"
            size="lg"
            leftIcon={<Zap className="w-4 h-4" />}
            onClick={() => setIsDeployModalOpen(true)}
            className="w-full md:w-auto shadow-lg shadow-amber-600/20"
          >
            Deploy Unit to {zone.zoneName}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Zone Perimeter OpenStreetMap</span>
            </h3>
            <LeafletMap
              zones={[zone]}
              officers={assignedOfficers}
              reports={zoneReports}
              center={[zone.latitude, zone.longitude]}
              zoom={14}
              height="380px"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Incident Logs Near {zone.zoneName} ({zoneReports.length})</span>
            </h3>

            {zoneReports.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
                No active citizen reports logged for {zone.zoneName} currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zoneReports.map((report) => (
                  <IncidentReportCard
                    key={report.reportId}
                    report={report}
                    isPoliceView={true}
                    onUpdateStatus={updateReportStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card variant="glass" className="p-5 space-y-5">
            <h3 className="font-bold text-white border-b border-slate-800 pb-3 text-base">
              Zone Risk Analytics
            </h3>

            <RiskIndicator score={zone.riskScore} label="Calculated Risk Index" size="lg" />

            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Coverage Ratio</span>
                <span className="font-bold text-white">
                  {zone.currentCoverage} / {zone.requiredCoverage} Personnel
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Police Coverage Gap</span>
                <span className={`font-bold ${zone.coverageGap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {zone.coverageGap > 0 ? `+${zone.coverageGap} Required` : 'Fully Covered'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Congestion Bottleneck</span>
                <span className="font-bold text-amber-400">{zone.congestionLevel}% Severity</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Recent Accidents</span>
                <span className="font-bold text-slate-100">{zone.recentAccidents} Collisions</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Weather Condition</span>
                <span className="font-bold text-blue-400">{zone.rainfallCondition}</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Assigned Personnel ({assignedOfficers.length})</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsDeployModalOpen(true)} className="text-xs p-0 text-amber-400">
                + Add Unit
              </Button>
            </div>

            {assignedOfficers.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                No officers currently assigned to {zone.zoneName}.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedOfficers.map((off) => (
                  <div key={off.officerId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{off.officerName}</div>
                      <div className="text-slate-400 text-[11px]">{off.rank} • {off.badgeNumber}</div>
                    </div>
                    <StatusBadge type="officer" value={off.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        targetZone={zone}
        officers={officers}
        onDeploy={deployOfficer}
      />
    </div>
  );
};
