import React from 'react';
import { clsx } from 'clsx';
import type { RiskLevel, TrafficLevel, OfficerStatus, ReportStatus } from '../../types/traffic';
import {
  getRiskLevelColor,
  getTrafficBadgeColor,
  getOfficerStatusColor,
  getReportStatusColor
} from '../../utils/formatters';

export interface StatusBadgeProps {
  type: 'risk' | 'traffic' | 'officer' | 'report' | 'verification';
  value: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  size = 'md',
  pulse = false
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'risk') {
    styleClasses = getRiskLevelColor(value as RiskLevel);
  } else if (type === 'traffic') {
    styleClasses = getTrafficBadgeColor(value as TrafficLevel);
  } else if (type === 'officer') {
    styleClasses = getOfficerStatusColor(value as OfficerStatus);
  } else if (type === 'report') {
    styleClasses = getReportStatusColor(value as ReportStatus);
  } else if (type === 'verification') {
    if (value === 'Verified') styleClasses = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    else if (value === 'Pending') styleClasses = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    else styleClasses = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors',
        sizeClasses,
        styleClasses
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      <span>{value}</span>
    </span>
  );
};
