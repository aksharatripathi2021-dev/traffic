import React from 'react';
import type { PoliceOfficer } from '../../types/traffic';
import { Table } from '../common/Table';
import type { Column } from '../common/Table';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { ShieldCheck, MapPin, Phone } from 'lucide-react';

export interface OfficerStatusListProps {
  officers: PoliceOfficer[];
  onDispatchClick?: (officer: PoliceOfficer) => void;
}

export const OfficerStatusList: React.FC<OfficerStatusListProps> = ({
  officers,
  onDispatchClick
}) => {
  const columns: Column<PoliceOfficer>[] = [
    {
      key: 'officerName',
      header: 'Officer / Badge',
      render: (off) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">{off.officerName}</div>
            <div className="text-xs text-slate-400">
              {off.rank} • {off.badgeNumber}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'currentLocation',
      header: 'Current Location',
      render: (off) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{off.currentLocation}</span>
        </div>
      )
    },
    {
      key: 'assignedZoneName',
      header: 'Assigned Zone',
      render: (off) => (
        <span className="text-xs font-medium text-slate-200">
          {off.assignedZoneName || <span className="text-slate-500 italic">Unassigned</span>}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Duty Status',
      render: (off) => <StatusBadge type="officer" value={off.status} size="sm" />
    },
    {
      key: 'distance',
      header: 'Proximity',
      render: (off) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">{off.distance}</div>
          <div className="text-slate-400 text-[11px]">ETA: {off.estimatedArrival}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (off) => (
        <div className="flex items-center gap-2">
          <a
            href={`tel:${off.phone}`}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={`Call ${off.officerName}`}
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          {onDispatchClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDispatchClick(off)}
              className="text-xs py-1 px-2.5"
            >
              Reassign
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={officers}
      keyExtractor={(off) => off.officerId}
      emptyMessage="No police officers currently active on roster."
    />
  );
};
