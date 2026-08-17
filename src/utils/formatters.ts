import type { RiskLevel, TrafficLevel, OfficerStatus, ReportStatus } from '../types/traffic';

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'LOW':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}

export function getTrafficBadgeColor(level: TrafficLevel): string {
  switch (level) {
    case 'Severe':
      return 'bg-red-950 text-red-300 border-red-800';
    case 'High':
      return 'bg-amber-950 text-amber-300 border-amber-800';
    case 'Moderate':
      return 'bg-blue-950 text-blue-300 border-blue-800';
    case 'Low':
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  }
}

export function getOfficerStatusColor(status: OfficerStatus): string {
  switch (status) {
    case 'On Duty':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'En Route':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Assigned':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Available':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'Off Duty':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getReportStatusColor(status: ReportStatus): string {
  switch (status) {
    case 'Verified':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Action Taken':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Resolved':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Pending':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Rejected':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}
