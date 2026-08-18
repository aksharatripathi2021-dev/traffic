import type { Zone, PoliceOfficer, CitizenReport } from '../types/traffic';
import { INITIAL_ZONES } from '../data/mockZones';
import { INITIAL_OFFICERS } from '../data/mockOfficers';
import { INITIAL_REPORTS } from '../data/mockReports';

const STORAGE_KEYS = {
  ZONES: 'nirnay_zones_v2',
  OFFICERS: 'nirnay_officers_v2',
  REPORTS: 'nirnay_reports_v2'
};

export const storageService = {
  getZones(): Zone[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ZONES);
      if (!data) {
        this.saveZones(INITIAL_ZONES);
        return INITIAL_ZONES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ZONES;
    }
  },

  saveZones(zones: Zone[]): void {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  },

  getOfficers(): PoliceOfficer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICERS);
      if (!data) {
        this.saveOfficers(INITIAL_OFFICERS);
        return INITIAL_OFFICERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_OFFICERS;
    }
  },

  saveOfficers(officers: PoliceOfficer[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
  },

  getReports(): CitizenReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) {
        this.saveReports(INITIAL_REPORTS);
        return INITIAL_REPORTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REPORTS;
    }
  },

  saveReports(reports: CitizenReport[]): void {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  resetAllData(): void {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(INITIAL_ZONES));
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(INITIAL_OFFICERS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
  }
};
