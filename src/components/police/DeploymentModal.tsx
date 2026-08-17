import React, { useState } from 'react';
import type { PoliceOfficer, Zone } from '../../types/traffic';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';

export interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetZone: Zone | null;
  officers: PoliceOfficer[];
  onDeploy: (officerId: string, zoneId: string) => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
  targetZone,
  officers,
  onDeploy
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  if (!targetZone) return null;

  const handleConfirm = () => {
    if (selectedOfficerId && targetZone) {
      onDeploy(selectedOfficerId, targetZone.zoneId);
      setSelectedOfficerId('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deploy Unit to ${targetZone.zoneName}`}
      subtitle={`Zone Coverage Gap: ${targetZone.coverageGap} Police Personnel Needed`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="warning"
            disabled={!selectedOfficerId}
            onClick={handleConfirm}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Confirm Dispatch & Recalculate Risk
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Target Junction</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{targetZone.zoneName}</span>
              <StatusBadge type="traffic" value={targetZone.trafficLevel} size="sm" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Current / Required</div>
            <div className="text-sm font-semibold text-amber-400">
              {targetZone.currentCoverage} / {targetZone.requiredCoverage} Officers
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Personnel to Reassign / Dispatch
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {officers.map((officer) => {
              const isSelected = selectedOfficerId === officer.officerId;
              const isCurrentlyAssignedHere = officer.assignedZoneId === targetZone.zoneId;

              return (
                <div
                  key={officer.officerId}
                  onClick={() => setSelectedOfficerId(officer.officerId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {officer.badgeNumber.split('-')[1] || 'OFF'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{officer.officerName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{officer.rank}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {officer.currentLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge type="officer" value={officer.status} size="sm" />
                    {isCurrentlyAssignedHere && (
                      <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        Assigned Here
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {targetZone.coverageGap > 0 && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Dispatching an officer will automatically reduce coverage gap to{' '}
              <strong>{targetZone.coverageGap - 1}</strong> and lower the AI risk score.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
