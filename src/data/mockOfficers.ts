import type { PoliceOfficer } from '../types/traffic';

export const INITIAL_OFFICERS: PoliceOfficer[] = [
  {
    officerId: 'OFF-101',
    officerName: 'ASI Rajesh Sharma',
    rank: 'Assistant Sub-Inspector',
    badgeNumber: 'NGP-3402',
    phone: '+91 98230 11204',
    distance: '0.4 km',
    estimatedArrival: '3 mins',
    status: 'On Duty',
    currentLocation: 'Sitabuldi Interchange',
    assignedZoneId: 'SITABULDI-02',
    assignedZoneName: 'Sitabuldi'
  },
  {
    officerId: 'OFF-102',
    officerName: 'Constable Sunil Verma',
    rank: 'Head Constable',
    badgeNumber: 'NGP-1189',
    phone: '+91 94221 88390',
    distance: '0.8 km',
    estimatedArrival: '6 mins',
    status: 'On Duty',
    currentLocation: 'Pardi Flyover Exit',
    assignedZoneId: 'PARDI-01',
    assignedZoneName: 'Pardi Junction'
  },
  {
    officerId: 'OFF-103',
    officerName: 'Inspector Priya Deshmukh',
    rank: 'Traffic Inspector',
    badgeNumber: 'NGP-0054',
    phone: '+91 97654 22001',
    distance: '1.2 km',
    estimatedArrival: '8 mins',
    status: 'Available',
    currentLocation: 'Police Control Room, Civil Lines',
    assignedZoneId: undefined,
    assignedZoneName: undefined
  },
  {
    officerId: 'OFF-104',
    officerName: 'Constable Amit Patil',
    rank: 'Police Constable',
    badgeNumber: 'NGP-5541',
    phone: '+91 98901 33412',
    distance: '0.5 km',
    estimatedArrival: '4 mins',
    status: 'En Route',
    currentLocation: 'Sadar Bazar Road',
    assignedZoneId: 'SADAR-05',
    assignedZoneName: 'Sadar'
  },
  {
    officerId: 'OFF-105',
    officerName: 'ASI Vinod Gawande',
    rank: 'Assistant Sub-Inspector',
    badgeNumber: 'NGP-2219',
    phone: '+91 91580 99401',
    distance: '0.3 km',
    estimatedArrival: '2 mins',
    status: 'On Duty',
    currentLocation: 'Manish Nagar Railway Underpass',
    assignedZoneId: 'MANISH-03',
    assignedZoneName: 'Manish Nagar'
  },
  {
    officerId: 'OFF-106',
    officerName: 'Constable Vikas Wankhede',
    rank: 'Police Constable',
    badgeNumber: 'NGP-4432',
    phone: '+91 93701 44512',
    distance: '1.5 km',
    estimatedArrival: '10 mins',
    status: 'Available',
    currentLocation: 'Dharampeth Traffic Post',
    assignedZoneId: 'DHARAMPETH-06',
    assignedZoneName: 'Dharampeth'
  },
  {
    officerId: 'OFF-107',
    officerName: 'Constable Sachin Tembhre',
    rank: 'Head Constable',
    badgeNumber: 'NGP-6721',
    phone: '+91 99214 77810',
    distance: '2.1 km',
    estimatedArrival: '12 mins',
    status: 'Available',
    currentLocation: 'Wardha Road Square',
    assignedZoneId: 'WARDHA-04',
    assignedZoneName: 'Wardha Road'
  }
];
