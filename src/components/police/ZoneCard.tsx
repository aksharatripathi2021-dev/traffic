import React from 'react';
import type { Zone } from '../../types/traffic';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { RiskIndicator } from '../common/RiskIndicator';
import { Button } from '../common/Button';
import { TrendingUp, TrendingDown, Minus, CloudRain, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { getRiskLevel } from '../../utils/riskCalculator';

export interface ZoneCardProps {
  zone: Zone;
  onSelect: (zoneId: string) => void;
  onDeploy: (zoneId: string) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({ zone, onSelect, onDeploy }) => {
  const riskLevel = getRiskLevel(zone.riskScore);

  const getAccent = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'red' as const;
      case 'HIGH':
        return 'amber' as const;
      case 'MEDIUM':
        return 'amber' as const;
      case 'LOW':
        return 'emerald' as const;
    }
  };

  const getTrendIcon = () => {
    switch (zone.riskTrend) {
      case 'Increasing':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'Decreasing':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card variant="accent" accentColor={getAccent()} className="hover:border-slate-700 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="font-bold text-base text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelect(zone.zoneId)}>
              {zone.zoneName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge type="traffic" value={zone.trafficLevel} size="sm" />
              <div className="flex items-center gap-1 text-xs text-slate-400">
                {getTrendIcon()}
                <span>{zone.riskTrend}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge type="risk" value={riskLevel} size="md" pulse={riskLevel === 'CRITICAL'} />
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <RiskIndicator score={zone.riskScore} label="Dynamic Risk Index" size="sm" />

        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-slate-400 flex items-center gap-1 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Coverage Ratio</span>
            </div>
            <div className="font-bold text-slate-100">
              {zone.currentCoverage} / {zone.requiredCoverage} Units
            </div>
            {zone.coverageGap > 0 ? (
              <span className="text-[11px] text-red-400 font-semibold">Gap: +{zone.coverageGap} Needed</span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-semibold">Optimal Coverage</span>
            )}
          </div>

          <div>
            <div className="text-slate-400 flex items-center gap-1 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Accidents / Congestion</span>
            </div>
            <div className="font-bold text-slate-100">{zone.recentAccidents} Recent</div>
            <span className="text-[11px] text-slate-400">{zone.congestionLevel}% Bottleneck</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1 text-blue-300">
            <CloudRain className="w-3.5 h-3.5" />
            <span>{zone.rainfallCondition}</span>
          </div>
          <span>Updated {zone.lastUpdated}</span>
        </div>
      </CardBody>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(zone.zoneId)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          className="text-xs"
        >
          Zone Analytics
        </Button>

        <Button
          variant={zone.coverageGap > 0 ? 'warning' : 'secondary'}
          size="sm"
          onClick={() => onDeploy(zone.zoneId)}
          className="text-xs"
        >
          Deploy Patrol
        </Button>
      </CardFooter>
    </Card>
  );
};
