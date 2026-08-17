import React from 'react';
import { getRiskLevel } from '../../utils/riskCalculator';

export interface RiskIndicatorProps {
  score: number;
  label?: string;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  label = 'Risk Index',
  showBar = true,
  size = 'md'
}) => {
  const level = getRiskLevel(score);

  const levelColorMap = {
    CRITICAL: 'text-red-400 bg-red-500',
    HIGH: 'text-orange-400 bg-orange-500',
    MEDIUM: 'text-amber-400 bg-amber-500',
    LOW: 'text-emerald-400 bg-emerald-500'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-bold'
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-slate-400 font-medium ${textSizes[size]}`}>{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${levelColorMap[level].split(' ')[0]} ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
            {score}/100
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${levelColorMap[level].split(' ')[0]} bg-slate-800 border border-slate-700`}>
            {level}
          </span>
        </div>
      </div>

      {showBar && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${levelColorMap[level].split(' ')[1]}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
