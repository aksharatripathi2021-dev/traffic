import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../hooks/useMockData';
import { LeafletMap } from '../../components/map/LeafletMap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { IncidentReportCard } from '../../components/citizen/IncidentReportCard';
import type { PoliceOfficer, RecommendationStatus } from '../../types/traffic';
import { getRiskLevel } from '../../utils/riskCalculator';
import { calculateAIRecommendation } from '../../utils/aiRecommendation';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  Edit3,
  LogOut,
  Cpu,
  UserCheck,
  CloudRain
} from 'lucide-react';

export const PoliceDashboard: React.FC = () => {
  const { zones, officers, reports, deployOfficer, updateReportStatus, resetData } = useMockData();
  const navigate = useNavigate();

  const zoneDetailsRef = useRef<HTMLDivElement>(null);

  // Session State
  const [policeName, setPoliceName] = useState('Inspector Priya Deshmukh');
  const [policeBadge, setPoliceBadge] = useState('NGP-0054');

  // Currently Selected Zone state
  const [selectedZoneId, setSelectedZoneId] = useState<string>('PARDI-01');
  const [recommendationStateMap, setRecommendationStateMap] = useState<Record<string, RecommendationStatus>>({});

  // Modify Recommendation Modal
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [customSelectedOfficerId, setCustomSelectedOfficerId] = useState<string>('');

  // Zone Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('nirnay_police_name');
    const savedBadge = localStorage.getItem('nirnay_police_badge');
    if (savedName) setPoliceName(savedName);
    if (savedBadge) setPoliceBadge(savedBadge);

    const savedRecs = localStorage.getItem('nirnay_rec_states');
    if (savedRecs) {
      try {
        setRecommendationStateMap(JSON.parse(savedRecs));
      } catch {
        // Fallback
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nirnay_user_role');
    localStorage.removeItem('nirnay_police_name');
    localStorage.removeItem('nirnay_police_badge');
    navigate('/police/login');
  };

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setTimeout(() => {
      zoneDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const selectedZone = zones.find((z) => z.zoneId === selectedZoneId) || zones[0];
  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto" />
          <p className="text-xs text-slate-400">Loading Tactical Command Center...</p>
        </div>
      </div>
    );
  }
  const riskLevel = getRiskLevel(selectedZone.riskScore);

  const aiResult = calculateAIRecommendation(selectedZone, officers);
  const currentRecState = recommendationStateMap[selectedZone.zoneId] || 'Pending Recommendation';

  const handleSetRecState = (status: RecommendationStatus) => {
    const updated = { ...recommendationStateMap, [selectedZone.zoneId]: status };
    setRecommendationStateMap(updated);
    localStorage.setItem('nirnay_rec_states', JSON.stringify(updated));
  };

  const handleAcceptRecommendation = () => {
    if (aiResult.recommendedOfficers.length > 0) {
      const primaryOfficer = aiResult.recommendedOfficers[0];
      deployOfficer(primaryOfficer.officerId, selectedZone.zoneId);
    }
    handleSetRecState('Accepted');
  };

  const handleRejectRecommendation = () => {
    handleSetRecState('Rejected');
  };

  const handleConfirmModifyDeployment = () => {
    if (customSelectedOfficerId && selectedZone) {
      deployOfficer(customSelectedOfficerId, selectedZone.zoneId);
      handleSetRecState('Modified');
      setIsModifyModalOpen(false);
      setCustomSelectedOfficerId('');
    }
  };

  const filteredZones = zones.filter((zone) =>
    zone.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const officerColumns: Column<PoliceOfficer>[] = [
    {
      key: 'officerName',
      header: 'Officer / Badge',
      render: (off) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-white text-xs">{off.officerName}</div>
            <div className="text-[10px] text-slate-400">{off.rank} • {off.badgeNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'distance',
      header: 'Distance',
      render: (off) => <span className="font-mono text-xs text-amber-400 font-semibold">{off.distance}</span>
    },
    {
      key: 'estimatedArrival',
      header: 'ETA Response',
      render: (off) => <span className="text-xs text-slate-200">{off.estimatedArrival}</span>
    },
    {
      key: 'status',
      header: 'Duty Status',
      render: (off) => <StatusBadge type="officer" value={off.status} size="sm" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100 selection:bg-amber-600 selection:text-white">
      {/* Top Header: NIRNAY Police Command Dashboard + Session Profile */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TACTICAL COMMAND ROOM</span>
            </span>
            <span className="text-xs text-slate-400">Nagpur Traffic Police Department</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Police Command Dashboard</h1>
          <p className="text-xs text-slate-300">
            AI-assisted risk detection, live patrol coverage gap analysis, and automated officer deployment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{policeName}</span>
            </div>
            <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Badge ID: <strong className="text-amber-400 font-mono">{policeBadge}</strong></span>
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

      {/* SECTION 1: NAGPUR RISK / TRAFFIC MAP */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>1. Nagpur Risk / Traffic Map</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any zone circle to inspect telemetry and trigger AI deployment on the same screen
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search junction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <Button variant="outline" size="sm" onClick={resetData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Reset Seed
            </Button>
          </div>
        </div>

        <LeafletMap
          zones={zones}
          officers={officers}
          reports={reports}
          center={[selectedZone.latitude, selectedZone.longitude]}
          zoom={13}
          onSelectZone={handleSelectZone}
          height="420px"
        />

        <div className="flex items-center gap-2 overflow-x-auto py-2 pr-1">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Select Zone:</span>
          {filteredZones.map((z) => (
            <button
              key={z.zoneId}
              onClick={() => handleSelectZone(z.zoneId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all flex items-center gap-1.5 ${
                selectedZoneId === z.zoneId
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>{z.zoneName}</span>
              <StatusBadge type="risk" value={getRiskLevel(z.riskScore)} size="sm" />
            </button>
          ))}
        </div>
      </div>

      {/* CONTINUOUS SINGLE INTEGRATED COMMAND PANEL (SECTIONS 2 to 8) */}
      <div ref={zoneDetailsRef} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 scroll-mt-6">
        
        {/* TOP ROW: SECTION 2 (Zone Info) + SECTION 3 (Risk Score Gauge) + SECTION 5 (Police Coverage) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-800 pb-6">
          
          {/* SECTION 2: SELECTED ZONE INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                2. Selected Zone Information
              </span>
              <span className="font-mono text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                Zone ID: {selectedZone.zoneId}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-white">{selectedZone.zoneName}</h3>
                <StatusBadge type="risk" value={riskLevel} size="md" pulse={riskLevel === 'CRITICAL'} />
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Current Traffic Level</span>
                  <StatusBadge type="traffic" value={selectedZone.trafficLevel} size="sm" />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Rain / Weather Condition</span>
                  <span className="font-semibold text-blue-400 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    {selectedZone.rainfallCondition}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-400">Congestion Severity</span>
                  <span className="font-bold text-amber-400">{selectedZone.congestionLevel}% Bottleneck</span>
                </div>

                <div className="flex justify-between items-center py-1 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Last Data Update</span>
                  </span>
                  <span className="text-slate-200 font-semibold">{selectedZone.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RISK SCORE (VISUAL GAUGE) */}
          <div className="space-y-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              3. Dynamic Risk Score Gauge
            </span>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center h-[210px] relative overflow-hidden">
              <div className="text-5xl font-black tracking-tight text-white mb-1">
                {selectedZone.riskScore} <span className="text-xl text-slate-500 font-normal">/ 100</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-3 max-w-[220px] overflow-hidden my-3 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    riskLevel === 'CRITICAL'
                      ? 'bg-red-500 shadow-md shadow-red-500/50'
                      : riskLevel === 'HIGH'
                      ? 'bg-orange-500 shadow-md shadow-orange-500/50'
                      : riskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedZone.riskScore}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Risk Classification:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded border uppercase ${
                    riskLevel === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : riskLevel === 'HIGH'
                      ? 'bg-orange-950 text-orange-400 border-orange-800'
                      : riskLevel === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {riskLevel} RISK
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: CURRENT POLICE COVERAGE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                5. Current Police Coverage
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  aiResult.coverageStatus === 'UNDER COVERED'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : aiResult.coverageStatus === 'ADEQUATELY COVERED'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-blue-950 text-blue-400 border-blue-800'
                }`}
              >
                {aiResult.coverageStatus}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Currently Deployed</div>
                  <div className="text-xl font-bold text-white mt-0.5">{selectedZone.currentCoverage} Officers</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Required Coverage</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">{selectedZone.requiredCoverage} Officers</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Coverage Gap</span>
                <span className={`font-bold ${selectedZone.coverageGap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedZone.coverageGap > 0 ? `+${selectedZone.coverageGap} Personnel Needed` : '0 (Optimal)'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Coverage Percentage</span>
                  <span className="font-bold text-slate-200">{aiResult.coveragePercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      aiResult.coveragePercentage < 60 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, aiResult.coveragePercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECOND ROW: SECTION 4 (Risk Trend Line Chart) + SECTION 6 (Nearby Officers Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-800 pb-6">
          
          {/* SECTION 4: RISK TREND (SVG TIME SERIES LINE CHART) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>4. Risk Trend Over Time</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                {selectedZone.riskTrend === 'Increasing' ? (
                  <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                    <TrendingUp className="w-3.5 h-3.5" /> INCREASING
                  </span>
                ) : selectedZone.riskTrend === 'Decreasing' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <TrendingDown className="w-3.5 h-3.5" /> DECREASING
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <Minus className="w-3.5 h-3.5" /> STABLE
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="h-36 w-full relative flex items-end pt-4 pb-2 px-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="#1e293b" strokeDasharray="3,3" />

                  <path
                    d={`M 0,${100 - aiResult.timeSeriesTrend[0].score * 0.8} 
                       L 100,${100 - aiResult.timeSeriesTrend[1].score * 0.8} 
                       L 200,${100 - aiResult.timeSeriesTrend[2].score * 0.8} 
                       L 300,${100 - aiResult.timeSeriesTrend[3].score * 0.8}`}
                    fill="none"
                    stroke={selectedZone.riskTrend === 'Increasing' ? '#ef4444' : '#f59e0b'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {aiResult.timeSeriesTrend.map((pt, i) => (
                    <circle
                      key={i}
                      cx={i * 100}
                      cy={100 - pt.score * 0.8}
                      r="4.5"
                      fill="#0f172a"
                      stroke={selectedZone.riskTrend === 'Increasing' ? '#ef4444' : '#f59e0b'}
                      strokeWidth="2.5"
                    />
                  ))}
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs border-t border-slate-800 pt-3">
                {aiResult.timeSeriesTrend.map((pt, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500">{pt.time}</div>
                    <div className="font-bold text-amber-400">{pt.score}</div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/60 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Risk Trend Statement:</strong> Risk Trend: {selectedZone.riskTrend}.{' '}
                  {selectedZone.riskTrend === 'Increasing' ? 'Immediate deployment recommended!' : 'Monitor patrol density.'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 6: NEARBY AVAILABLE OFFICERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>6. Nearby Available Officers</span>
              </span>
              <span className="text-xs text-slate-400">{officers.length} Active Roster</span>
            </div>

            <Table
              columns={officerColumns}
              data={officers.slice(0, 4)}
              keyExtractor={(off) => off.officerId}
              emptyMessage="No available police officers nearby."
              className="bg-slate-950"
            />
          </div>
        </div>

        {/* THIRD ROW: SECTION 7 (NIRNAY AI RECOMMENDATION) & SECTION 8 (MODIFY / ACCEPT / REJECT ACTIONS) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>7. NIRNAY AI RECOMMENDATION</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Computed dynamically from risk score, trend, coverage gap, officer distance & availability
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {aiResult.isNecessaryToDeploy && (
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/20 animate-pulse">
                  NECESSARY TO DEPLOY
                </span>
              )}

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  currentRecState === 'Accepted'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : currentRecState === 'Rejected'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : currentRecState === 'Modified'
                    ? 'bg-purple-950 text-purple-400 border-purple-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
              >
                Status: {currentRecState}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider">Recommended Officers</div>
              <div className="space-y-1.5 pt-1">
                {aiResult.recommendedOfficers.length === 0 ? (
                  <div className="text-slate-500 italic">No additional officers needed.</div>
                ) : (
                  aiResult.recommendedOfficers.map((off) => (
                    <div key={off.officerId} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-white">{off.officerName}</span>
                      <span className="text-amber-400 font-mono">{off.badgeNumber} ({off.distance})</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider">Estimated Response Window</div>
              <div className="text-2xl font-black text-amber-400 pt-1">{aiResult.estimatedResponse}</div>
              <p className="text-[11px] text-slate-400">Based on real-time officer proximity & traffic speed</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider">Decision Rationale</div>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-1">
                {aiResult.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 8: ACTION BUTTONS (MODIFY / ACCEPT / REJECT) */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsModifyModalOpen(true)}
              leftIcon={<Edit3 className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              MODIFY
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={handleRejectRecommendation}
              leftIcon={<X className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              REJECT
            </Button>

            <Button
              variant="warning"
              size="md"
              onClick={handleAcceptRecommendation}
              leftIcon={<Check className="w-4 h-4" />}
              className="w-full sm:w-auto font-bold shadow-lg shadow-amber-600/20"
            >
              ACCEPT RECOMMENDATION
            </Button>
          </div>
        </div>

        {/* CITIZEN INCIDENT VERIFICATION FEED */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Citizen Reports Verification Queue ({reports.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Click Verify or Resolve to update status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <IncidentReportCard
                key={report.reportId}
                report={report}
                isPoliceView={true}
                onUpdateStatus={updateReportStatus}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODIFY RECOMMENDATION MODAL */}
      <Modal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        title={`Modify Recommendation for ${selectedZone.zoneName}`}
        subtitle="Select a custom police officer to dispatch to this zone"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              disabled={!customSelectedOfficerId}
              onClick={handleConfirmModifyDeployment}
            >
              Confirm Modified Deployment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available Police Officers Roster
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {officers.map((off) => (
              <div
                key={off.officerId}
                onClick={() => setCustomSelectedOfficerId(off.officerId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  customSelectedOfficerId === off.officerId
                    ? 'bg-amber-950/80 border-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs">{off.officerName}</div>
                  <div className="text-[10px] text-slate-400">{off.rank} • {off.badgeNumber} • {off.distance}</div>
                </div>
                <StatusBadge type="officer" value={off.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
