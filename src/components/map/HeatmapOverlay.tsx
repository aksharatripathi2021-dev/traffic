import React from 'react';
import { Flame } from 'lucide-react';

export interface HeatmapLegendProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({
  criticalCount,
  highCount,
  mediumCount,
  lowCount
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        <span>Nagpur Risk Heat Index:</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
          <span>Critical ({criticalCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
          <span>High ({highCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span>Medium ({mediumCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Low ({lowCount})</span>
        </div>
      </div>
    </div>
  );
};
