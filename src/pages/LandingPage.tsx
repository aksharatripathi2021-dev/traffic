import React from 'react';
import { Link } from 'react-router-dom';
import { useMockData } from '../hooks/useMockData';
import { getRiskLevel } from '../utils/riskCalculator';
import {
  User,
  ShieldCheck,
  ArrowRight,
  Radio,
  Activity,
  RadioTower,
  Cpu,
  Flame
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { zones, officers, reports } = useMockData();

  const criticalCount = zones.filter((z) => getRiskLevel(z.riskScore) === 'CRITICAL').length;
  const activeOfficers = officers.filter((o) => o.status === 'On Duty' || o.status === 'En Route').length;

  return (
    <div className="min-h-[90vh] bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Hero & Role Selection Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Subtle Ambient Glow Background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative text-center space-y-6 max-w-4xl mx-auto">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-blue-400 text-xs font-semibold shadow-lg backdrop-blur-md">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>NAGPUR CITY SAFETY PLATFORM</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              NIRNAY
            </h1>
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-amber-300 to-red-400 bg-clip-text text-transparent tracking-tight">
              Intelligent Traffic Risk & Police Deployment System
            </h2>
          </div>

          {/* Professional Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            NIRNAY monitors traffic risk, citizen-reported incidents and police coverage to support faster response and better deployment.
          </p>

          {/* Main Role Action Options (2 Large Cards) */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Option 1: ENTER AS CITIZEN / USER */}
            <Link to="/citizen/login" className="group">
              <div className="h-full p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-blue-500/30 hover:border-blue-400/80 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] text-left relative overflow-hidden flex flex-col justify-between">
                {/* Accent Top Border Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg">
                      <User className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                      Public Portal
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    ENTER AS CITIZEN / USER
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    View live traffic hazard map, check Nagpur junction risk levels, submit geotagged incident reports, and track police response status.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                  <span>Access Citizen Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Option 2: ENTER AS POLICE */}
            <Link to="/police/login" className="group">
              <div className="h-full p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 hover:border-amber-400/80 shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-[1.03] text-left relative overflow-hidden flex flex-col justify-between">
                {/* Accent Top Border Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-400" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-lg">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                      Tactical Command
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    ENTER AS POLICE
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Access command room dashboard, analyze live Leaflet risk heatmaps, evaluate coverage gaps, and dispatch patrol units in real-time.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>Open Police Command Center</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Capability Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-16">
        <div className="border-t border-slate-900 pt-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              System Capabilities
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Integrated Traffic Intelligence & Deployment Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Traffic Monitoring */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Traffic Monitoring</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Continuous telemetry across major Nagpur junctions (Pardi, Sitabuldi, Sadar, Wardha Rd).
              </p>
            </div>

            {/* 2. Risk Detection */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center mb-3 border border-red-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Risk Detection</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Multi-factor risk index combining congestion, weather, collisions, and police gap.
              </p>
            </div>

            {/* 3. Citizen Reporting */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 border border-purple-500/30">
                <RadioTower className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Citizen Reporting</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Crowdsourced geotagged hazard intake with photo proof and community upvoting.
              </p>
            </div>

            {/* 4. Police Deployment */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Police Deployment</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Real-time patrol unit dispatching and active coverage gap reduction.
              </p>
            </div>

            {/* 5. AI-Assisted Recommendation */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors sm:col-span-2 lg:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">AI Recommendation</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Automated resource re-allocation logic to dynamically lower critical bottleneck risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Telemetry Bar */}
      <section className="bg-slate-900/80 border-t border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">Live Nagpur Data Feed Active</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <div>
              Monitored Zones: <span className="text-white font-bold">{zones.length}</span>
            </div>
            <div>
              Critical Hotspots: <span className="text-red-400 font-bold">{criticalCount}</span>
            </div>
            <div>
              Active Officers: <span className="text-blue-400 font-bold">{activeOfficers}</span>
            </div>
            <div>
              Citizen Reports: <span className="text-purple-400 font-bold">{reports.length}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
