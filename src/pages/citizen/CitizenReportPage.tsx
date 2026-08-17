import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockData } from '../../hooks/useMockData';
import { IncidentReportForm } from '../../components/citizen/IncidentReportForm';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CitizenReportPage: React.FC = () => {
  const { addReport } = useMockData();
  const navigate = useNavigate();

  const handleReportSubmit = (reportData: Parameters<typeof addReport>[0]) => {
    return addReport(reportData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/citizen/dashboard">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Citizen Dashboard
          </Button>
        </Link>
        <span className="text-xs text-slate-400">NIRNAY Intake Module</span>
      </div>

      <IncidentReportForm
        onSubmitReport={handleReportSubmit}
        onNavigateToDashboard={() => navigate('/citizen/dashboard')}
      />

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Verification & Command Intake Protocol</span>
        </div>
        <p>
          All submitted reports are instantly formatted and stored in mock state/localStorage, making them immediately visible on the Police Command Center feed.
        </p>
      </div>
    </div>
  );
};
