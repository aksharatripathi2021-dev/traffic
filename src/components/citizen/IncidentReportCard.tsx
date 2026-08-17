import React, { useState } from 'react';
import type { CitizenReport, ReportStatus, VerificationStatus } from '../../types/traffic';
import { Card, CardBody, CardFooter } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { MapPin, ThumbsUp, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export interface IncidentReportCardProps {
  report: CitizenReport;
  isPoliceView?: boolean;
  onUpdateStatus?: (reportId: string, status: ReportStatus, verificationStatus: VerificationStatus) => void;
}

export const IncidentReportCard: React.FC<IncidentReportCardProps> = ({
  report,
  isPoliceView = false,
  onUpdateStatus
}) => {
  const [upvotes, setUpvotes] = useState(report.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  return (
    <Card variant="glass" className="flex flex-col h-full hover:border-slate-700 transition-all">
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
        <img
          src={report.image}
          alt={report.incidentType}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-white border border-slate-700 shadow-md">
            {report.incidentType}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge type="report" value={report.status} size="sm" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate font-medium">{report.location}</span>
          </div>
        </div>
      </div>

      <CardBody className="flex-1 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {report.description}
        </p>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{report.date} at {report.time}</span>
          </div>
          <div>Reported by <span className="text-slate-300 font-medium">{report.reporterName}</span></div>
        </div>
      </CardBody>

      <CardFooter className="flex items-center justify-between">
        <button
          onClick={handleUpvote}
          disabled={hasUpvoted}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            hasUpvoted
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{upvotes} Confirmations</span>
        </button>

        {isPoliceView && onUpdateStatus && (
          <div className="flex items-center gap-1.5">
            {report.status !== 'Verified' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(report.reportId, 'Verified', 'Verified')}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                className="text-[11px] py-1 px-2"
              >
                Verify
              </Button>
            )}
            {report.status !== 'Resolved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(report.reportId, 'Resolved', 'Verified')}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                className="text-[11px] py-1 px-2"
              >
                Resolve
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
