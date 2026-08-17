import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/Toast';
import { MapPin } from 'lucide-react';

export interface MainLayoutProps {
  currentRole?: 'citizen' | 'police' | null;
  onResetData?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentRole, onResetData }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar currentRole={currentRole} onResetData={onResetData} />
      <ToastContainer />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 text-slate-500 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="font-bold text-slate-300 text-sm">NIRNAY System</span>
            <span>— Nagpur Intelligent Traffic Risk & Police Deployment</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Nagpur, Maharashtra
            </span>
            <span>Live Local Mock Data</span>
            <span className="text-slate-600">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
