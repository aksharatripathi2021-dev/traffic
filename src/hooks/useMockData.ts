import { useState, useEffect, useCallback } from 'react';
import type { Zone, PoliceOfficer, CitizenReport, ReportStatus, VerificationStatus } from '../types/traffic';
import { storageService } from '../services/storageService';
import { recalculateZoneMetrics } from '../utils/riskCalculator';
import { useToast } from './useToast';

export function useMockData() {
  // Eagerly initialize state from storageService to avoid empty arrays on first render
  const [zones, setZones] = useState<Zone[]>(() => storageService.getZones());
  const [officers, setOfficers] = useState<PoliceOfficer[]>(() => storageService.getOfficers());
  const [reports, setReports] = useState<CitizenReport[]>(() => storageService.getReports());
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const loadAllData = useCallback(() => {
    setLoading(true);
    const z = storageService.getZones();
    const o = storageService.getOfficers();
    const r = storageService.getReports();
    setZones(z);
    setOfficers(o);
    setReports(r);
    setLoading(false);
  }, []);

  // Sync back to localStorage when changed
  const deployOfficer = useCallback((officerId: string, targetZoneId: string) => {
    setOfficers((prevOfficers) => {
      const officer = prevOfficers.find((o) => o.officerId === officerId);
      if (!officer) return prevOfficers;

      const previousZoneId = officer.assignedZoneId;

      setZones((prevZones) => {
        const updatedZones = prevZones.map((z) => {
          let currentCoverage = z.currentCoverage;

          if (previousZoneId && z.zoneId === previousZoneId && previousZoneId !== targetZoneId) {
            currentCoverage = Math.max(0, currentCoverage - 1);
          }

          if (z.zoneId === targetZoneId) {
            currentCoverage = currentCoverage + 1;
          }

          const updatedZone = recalculateZoneMetrics(z, currentCoverage);
          return updatedZone;
        });
        storageService.saveZones(updatedZones);
        return updatedZones;
      });

      const targetZone = zones.find((z) => z.zoneId === targetZoneId);
      const updatedOfficers = prevOfficers.map((o) => {
        if (o.officerId === officerId) {
          return {
            ...o,
            status: 'On Duty' as const,
            assignedZoneId: targetZoneId,
            assignedZoneName: targetZone?.zoneName || targetZoneId,
            estimatedArrival: 'Dispatched (2 mins)'
          };
        }
        return o;
      });

      storageService.saveOfficers(updatedOfficers);
      addToast(
        'Officer Dispatched Successfully',
        `${officer.officerName} has been assigned to ${targetZone?.zoneName || targetZoneId}. Zone coverage risk recalculated!`,
        'success'
      );
      return updatedOfficers;
    });
  }, [zones, addToast]);

  const addReport = useCallback((reportInput: Omit<CitizenReport, 'reportId' | 'date' | 'time' | 'status' | 'verificationStatus' | 'upvotes'>): CitizenReport => {
    const newReportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newReport: CitizenReport = {
      ...reportInput,
      reportId: newReportId,
      date,
      time,
      status: 'Pending',
      verificationStatus: 'Unverified',
      upvotes: 1
    };

    setReports((prev) => {
      const updated = [newReport, ...prev];
      storageService.saveReports(updated);
      return updated;
    });

    addToast(
      'Incident Report Submitted',
      `Report #${newReportId} at ${reportInput.location} sent to Nagpur Traffic Police Command Center.`,
      'success'
    );

    return newReport;
  }, [addToast]);

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus, verificationStatus: VerificationStatus) => {
    setReports((prev) => {
      const updated = prev.map((r) => {
        if (r.reportId === reportId) {
          return { ...r, status, verificationStatus };
        }
        return r;
      });
      storageService.saveReports(updated);
      return updated;
    });

    addToast(
      'Report Status Updated',
      `Report ${reportId} marked as ${status} (${verificationStatus}).`,
      'info'
    );
  }, [addToast]);

  const resetData = useCallback(() => {
    storageService.resetAllData();
    loadAllData();
    addToast('Data Reset', 'All Nagpur traffic data reset to default demo values.', 'info');
  }, [loadAllData, addToast]);

  useEffect(() => {
    if (zones.length > 0 && !loading) {
      storageService.saveZones(zones);
    }
  }, [zones, loading]);

  return {
    zones,
    officers,
    reports,
    loading,
    deployOfficer,
    addReport,
    updateReportStatus,
    resetData,
    refreshData: loadAllData
  };
}
