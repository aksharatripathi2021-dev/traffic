import type { Zone, PoliceOfficer } from '../types/traffic';

export interface TimeSeriesPoint {
  time: string;
  score: number;
}

export interface AIRecommendationResult {
  recommendedOfficers: PoliceOfficer[];
  estimatedResponse: string;
  reasons: string[];
  isNecessaryToDeploy: boolean;
  coverageStatus: 'UNDER COVERED' | 'ADEQUATELY COVERED' | 'OVER COVERED';
  coveragePercentage: number;
  timeSeriesTrend: TimeSeriesPoint[];
}

/**
 * Dynamically computes risk trend time-series for a zone
 */
export function generateZoneTimeSeries(zone: Zone): TimeSeriesPoint[] {
  const baseScore = zone.riskScore;
  
  if (zone.riskTrend === 'Increasing') {
    return [
      { time: '10:00', score: Math.max(20, baseScore - 38) },
      { time: '10:15', score: Math.max(30, baseScore - 24) },
      { time: '10:30', score: Math.max(40, baseScore - 12) },
      { time: '10:45', score: baseScore }
    ];
  } else if (zone.riskTrend === 'Decreasing') {
    return [
      { time: '10:00', score: Math.min(95, baseScore + 32) },
      { time: '10:15', score: Math.min(85, baseScore + 20) },
      { time: '10:30', score: Math.min(75, baseScore + 10) },
      { time: '10:45', score: baseScore }
    ];
  } else {
    return [
      { time: '10:00', score: Math.max(0, baseScore - 3) },
      { time: '10:15', score: Math.min(100, baseScore + 2) },
      { time: '10:30', score: Math.max(0, baseScore - 1) },
      { time: '10:45', score: baseScore }
    ];
  }
}

/**
 * NIRNAY AI Deployment Recommendation Engine
 */
export function calculateAIRecommendation(
  zone: Zone,
  allOfficers: PoliceOfficer[]
): AIRecommendationResult {
  // 1. Calculate Coverage Status & Percentage
  const current = zone.currentCoverage;
  const required = Math.max(1, zone.requiredCoverage);
  const coveragePercentage = Math.round((current / required) * 100);

  let coverageStatus: 'UNDER COVERED' | 'ADEQUATELY COVERED' | 'OVER COVERED' = 'ADEQUATELY COVERED';
  if (current < required) {
    coverageStatus = 'UNDER COVERED';
  } else if (current > required) {
    coverageStatus = 'OVER COVERED';
  }

  // 2. Filter available officers or officers assigned elsewhere
  const availableOfficers = allOfficers.filter(
    (o) => o.status === 'Available' || o.assignedZoneId !== zone.zoneId
  );

  // Sort officers by distance/ETA
  const sortedOfficers = [...availableOfficers].sort((a, b) => {
    const distA = parseFloat(a.distance.replace(/[^\d.]/g, '')) || 99;
    const distB = parseFloat(b.distance.replace(/[^\d.]/g, '')) || 99;
    return distA - distB;
  });

  const gapCount = Math.max(1, zone.coverageGap);
  const recommendedOfficers = sortedOfficers.slice(0, gapCount);

  // 3. Compute Estimated Response Window
  let estimatedResponse = '5–8 minutes';
  if (recommendedOfficers.length > 0) {
    const firstEta = recommendedOfficers[0].estimatedArrival;
    estimatedResponse = `${firstEta} ETA window`;
  }

  // 4. Construct AI Reasoning Breakdown
  const reasons: string[] = [];
  if (zone.riskScore >= 75) {
    reasons.push(`High risk score (${zone.riskScore}/100) at bottleneck`);
  } else if (zone.riskScore >= 50) {
    reasons.push(`Moderate risk index (${zone.riskScore}/100) detected`);
  }

  if (zone.riskTrend === 'Increasing') {
    reasons.push('Risk trend is currently INCREASING over time');
  }

  if (zone.congestionLevel >= 70) {
    reasons.push(`Heavy traffic congestion severity (${zone.congestionLevel}%)`);
  }

  if (zone.recentAccidents > 0) {
    reasons.push(`Recent accident history (${zone.recentAccidents} collisions)`);
  }

  if (coverageStatus === 'UNDER COVERED') {
    reasons.push(`Current police coverage (${current}/${required}) is below required level`);
  }

  if (reasons.length === 0) {
    reasons.push('Routine preventive patrol monitoring recommended');
  }

  // 5. Determine if NECESSARY TO DEPLOY
  const isNecessaryToDeploy = zone.coverageGap > 0 && (zone.riskScore >= 50 || zone.riskTrend === 'Increasing');

  const timeSeriesTrend = generateZoneTimeSeries(zone);

  return {
    recommendedOfficers,
    estimatedResponse,
    reasons,
    isNecessaryToDeploy,
    coverageStatus,
    coveragePercentage,
    timeSeriesTrend
  };
}
