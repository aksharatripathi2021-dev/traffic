import type { Zone, RiskLevel } from '../types/traffic';

export function calculateRiskScore(
  congestionLevel: number,
  coverageGap: number,
  recentAccidents: number,
  rainfallCondition: string
): number {
  const congestionFactor = Math.min(100, Math.max(0, congestionLevel)) * 0.35;
  const gapFactor = Math.min(100, Math.max(0, coverageGap * 18)) * 0.30;
  const accidentFactor = Math.min(100, Math.max(0, recentAccidents * 12)) * 0.20;

  let rainMultiplier = 0;
  switch (rainfallCondition) {
    case 'Waterlogging':
      rainMultiplier = 100;
      break;
    case 'Heavy Rain':
      rainMultiplier = 85;
      break;
    case 'Moderate Rain':
      rainMultiplier = 50;
      break;
    case 'Light Rain':
      rainMultiplier = 25;
      break;
    default:
      rainMultiplier = 0;
  }
  const weatherFactor = rainMultiplier * 0.15;

  const score = Math.round(congestionFactor + gapFactor + accidentFactor + weatherFactor);
  return Math.min(100, Math.max(0, score));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export function recalculateZoneMetrics(zone: Zone, newCoverage: number): Zone {
  const coverageGap = Math.max(0, zone.requiredCoverage - newCoverage);
  const newRiskScore = calculateRiskScore(
    zone.congestionLevel,
    coverageGap,
    zone.recentAccidents,
    zone.rainfallCondition
  );

  let riskTrend: Zone['riskTrend'] = 'Stable';
  if (newRiskScore < zone.riskScore) {
    riskTrend = 'Decreasing';
  } else if (newRiskScore > zone.riskScore) {
    riskTrend = 'Increasing';
  }

  return {
    ...zone,
    currentCoverage: newCoverage,
    coverageGap,
    riskScore: newRiskScore,
    riskTrend,
    lastUpdated: 'Just now'
  };
}
