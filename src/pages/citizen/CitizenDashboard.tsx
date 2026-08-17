import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMockData } from '../../hooks/useMockData';
import { LeafletMap } from '../../components/map/LeafletMap';
import { IncidentReportCard } from '../../components/citizen/IncidentReportCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskIndicator } from '../../components/common/RiskIndicator';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import type { Zone } from '../../types/traffic';
import { getRiskLevel } from '../../utils/riskCalculator';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Search,
  User,
  Mail,
  LogOut,
  CloudRain,
  Activity,
  Flame,
  Clock,
  Plus
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { zones, reports } = useMockData();
  const navigate = useNavigate();

  // Citizen User Session State
  const [citizenName, setCitizenName] = useState('Aniket Deshmukh');
  const [citizenEmail, setCitizenEmail] = useState('aniket.deshmukh@nagpur.gov.in');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const storedName = localStorage.getItem('nirnay_citizen_name');
    const storedEmail = localStorage.getItem('nirnay_citizen_email');
    if (storedName) setCitizenName(storedName);
    if (storedEmail) setCitizenEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nirnay_user_role');
    localStorage.removeItem('nirnay_citizen_name');
    localStorage.removeItem('nirnay_citizen_email');
    navigate('/citizen/login');
  };

  const handleViewZoneDetail = (zoneId: string) => {
    const z = zones.find((item) => item.zoneId === zoneId);
    if (z) {
      setSelectedZone(z);
      setIsDetailModalOpen(true);
    }
  };

  if (zones.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
          <p className="text-xs text-slate-400">Loading Nagpur City Public Safety Portal...</p>
        </div>
      </div>
    );
  }

  const highestRiskZone = zones.reduce((prev, current) => (prev.riskScore > current.riskScore ? prev : current), zones[0]);
  const avgCongestion = Math.round(zones.reduce((acc, z) => acc + z.congestionLevel, 0) / (zones.length || 1));
  const activeRainCondition = zones.find((z) => z.rainfallCondition !== 'None')?.rainfallCondition || 'Clear / No Rain';

  const criticalCount = zones.filter((z) => getRiskLevel(z.riskScore) === 'CRITICAL').length;
  const highCount = zones.filter((z) => getRiskLevel(z.riskScore) === 'HIGH').length;
  const mediumCount = zones.filter((z) => getRiskLevel(z.riskScore) === 'MEDIUM').length;
  const lowCount = zones.filter((z) => getRiskLevel(z.riskScore) === 'LOW').length;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.incidentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || report.incidentType === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Integrated Header: NIRNAY Citizen Dashboard + User Session Profile */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              NIRNAY SYSTEM
            </span>
            <span className="text-xs font-semibold text-slate-400">Nagpur City Public Safety Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Citizen Dashboard</h1>
          <p className="text-xs text-slate-300">
            Real-time Nagpur junction risk map, weather bottleneck alerts, and geotagged incident reporting.
          </p>
        </div>

        {/* User Identity Pill & Logout */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
            {citizenName.charAt(0)}
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{citizenName}</span>
            </div>
            <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{citizenEmail}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="ml-auto text-xs py-1.5 px-2.5 border-slate-800 hover:border-red-500/50 hover:text-red-400"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Function 1: LIVE TRAFFIC & RISK MAP */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>1. Live Nagpur Traffic & Risk Map</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Leaflet map showing real-time risk density across 7 major Nagpur bottlenecks
            </p>
          </div>

          {/* Prominent Action Function 2: REPORT AN INCIDENT */}
          <Link to="/citizen/report">
            <Button
              variant="danger"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto font-bold shadow-lg shadow-red-600/25"
            >
              Report an Incident
            </Button>
          </Link>
        </div>

        {/* Map + Telemetry Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Column (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <LeafletMap
              zones={zones}
              reports={reports}
              onSelectZone={handleViewZoneDetail}
              height="460px"
            />

            {/* Small Legend Component */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Map Risk Color Legend:</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Green → Low Risk ({lowCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Yellow → Moderate Risk ({mediumCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Red → High Risk ({criticalCount + highCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Environmental & Traffic Telemetry Sidebar (1 Col) */}
          <div className="space-y-4">
            <Card variant="glass" className="p-5 space-y-4 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Environmental & Telemetry</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Traffic Congestion */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>City Traffic Congestion</span>
                    <span className="font-bold text-amber-400">{avgCongestion}% Avg</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${avgCongestion}%` }} />
                  </div>
                </div>

                {/* Rain / Weather Condition */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>Rain / Weather</span>
                  </span>
                  <span className="font-semibold text-blue-300">{activeRainCondition}</span>
                </div>

                {/* Highest Risk Level */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Highest Risk Zone</span>
                  </span>
                  <StatusBadge type="risk" value={getRiskLevel(highestRiskZone?.riskScore || 88)} size="sm" />
                </div>

                {/* Last Data Update */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Last Data Update</span>
                  </span>
                  <span className="font-semibold text-slate-200">Just now</span>
                </div>
              </div>
            </Card>

            {/* Quick Emergency Call Pill */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-xs space-y-2">
              <div className="font-bold text-red-300 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-red-400 animate-bounce" />
                <span>Nagpur Emergency Helpline</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                In case of severe road collisions or immediate danger call Traffic Control:
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href="tel:112"
                  className="w-full text-center py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                >
                  Dial 112
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Function 2: REPORT AN INCIDENT & COMMUNITY FEED SECTION */}
      <div className="space-y-4 pt-6 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>2. Citizen Incident Reports Feed</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified community hazard alerts synchronized with Nagpur Traffic Control
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search location or hazard type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Hazards</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Signal Failure">Signal Failure</option>
              <option value="Accident">Accidents</option>
              <option value="Congestion">Congestion</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <IncidentReportCard key={report.reportId} report={report} />
          ))}
        </div>
      </div>

      {/* Zone Full Details Modal Overlay */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedZone ? `${selectedZone.zoneName} Details` : 'Zone Details'}
        subtitle={selectedZone ? `Zone ID: ${selectedZone.zoneId} • Nagpur City` : ''}
        footer={
          <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
            Close Overview
          </Button>
        }
      >
        {selectedZone && (
          <div className="space-y-4 text-xs text-slate-200">
            <RiskIndicator score={selectedZone.riskScore} label="Dynamic Risk Score" size="lg" />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Traffic Level</span>
                <StatusBadge type="traffic" value={selectedZone.trafficLevel} size="sm" />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Congestion Severity</span>
                <span className="font-bold text-amber-400 text-sm">{selectedZone.congestionLevel}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Weather / Rain</span>
                <span className="font-semibold text-blue-300">{selectedZone.rainfallCondition}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Police Patrol Coverage</span>
                <span className="font-semibold text-slate-100">
                  {selectedZone.currentCoverage} / {selectedZone.requiredCoverage} Units
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-400">
              <span>GPS Coordinates</span>
              <span className="font-mono text-slate-200">
                {selectedZone.latitude.toFixed(4)}° N, {selectedZone.longitude.toFixed(4)}° E
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-400">
              <span>Last Data Update</span>
              <span className="text-slate-200">{selectedZone.lastUpdated}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
