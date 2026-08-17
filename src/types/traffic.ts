export type TrafficLevel = 'Low' | 'Moderate' | 'High' | 'Severe';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskTrend = 'Increasing' | 'Decreasing' | 'Stable';
export type RainfallCondition = 'None' | 'Light Rain' | 'Moderate Rain' | 'Heavy Rain' | 'Waterlogging';

export interface Zone {
  zoneId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  trafficLevel: TrafficLevel;
  riskScore: number; // 0 - 100
  riskTrend: RiskTrend;
  currentCoverage: number;
  requiredCoverage: number;
  coverageGap: number;
  recentAccidents: number;
  congestionLevel: number; // Percentage 0-100%
  rainfallCondition: RainfallCondition;
  lastUpdated: string;
}

export type OfficerStatus = 'On Duty' | 'Available' | 'En Route' | 'Assigned' | 'Off Duty';

export interface PoliceOfficer {
  officerId: string;
  officerName: string;
  rank: string;
  badgeNumber: string;
  phone: string;
  distance: string;
  estimatedArrival: string;
  status: OfficerStatus;
  currentLocation: string;
  assignedZoneId?: string;
  assignedZoneName?: string;
}

export type IncidentType = 
  | 'Accident' 
  | 'Road Blocked' 
  | 'Water Logging' 
  | 'Heavy Congestion'
  | 'Congestion' 
  | 'Waterlogging' 
  | 'Signal Failure' 
  | 'Road Hazard' 
  | 'Illegal Parking';

export type ReportStatus = 'Pending' | 'Verified' | 'Action Taken' | 'Resolved' | 'Rejected';
export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified' | 'Flagged';

export interface CitizenReport {
  reportId: string;
  incidentType: IncidentType;
  image: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  reporterName: string;
  reporterEmail: string;
  status: ReportStatus;
  verificationStatus: VerificationStatus;
  description: string;
  upvotes: number;
}

export type UserRole = 'citizen' | 'police' | null;

export type RecommendationStatus = 'Pending Recommendation' | 'Accepted' | 'Rejected' | 'Modified';

export interface DeploymentAction {
  officerId: string;
  zoneId: string;
  timestamp: string;
}
