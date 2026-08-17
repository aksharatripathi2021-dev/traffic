import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  User,
  ShieldCheck,
  AlertTriangle,
  Menu,
  X,
  MapPin,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Button } from './Button';

export interface NavbarProps {
  currentRole?: 'citizen' | 'police' | null;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onResetData }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isPolicePath = location.pathname.startsWith('/police');
  const activeRole = currentRole || (isPolicePath ? 'police' : 'citizen');

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform border border-blue-400/30">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  NIRNAY
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80 font-medium">
                  Nagpur Traffic AI
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <Link
              to="/citizen/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/citizen')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </Link>

            <Link
              to="/police/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/police')
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Police Command</span>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Action Button based on Role */}
            {activeRole === 'citizen' ? (
              <Link to="/citizen/report">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Report Hazard
                </Button>
              </Link>
            ) : (
              <Link to="/police/dashboard">
                <Button
                  variant="warning"
                  size="sm"
                  leftIcon={<MapPin className="w-4 h-4" />}
                >
                  Dispatch Units
                </Button>
              </Link>
            )}

            {onResetData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetData}
                className="p-2 text-slate-400 hover:text-white"
                title="Reset Mock Demo Data"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}

            <button
              onClick={() => navigate(activeRole === 'police' ? '/police/login' : '/citizen/login')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{activeRole === 'police' ? 'Police Login' : 'Citizen Login'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Navigation Portals
          </div>
          <Link
            to="/citizen/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>Citizen Dashboard</span>
          </Link>
          <Link
            to="/citizen/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Report Traffic Hazard</span>
          </Link>
          <Link
            to="/police/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Police Command Center</span>
          </Link>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {onResetData && (
              <button
                onClick={() => {
                  onResetData();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
            <Link
              to="/citizen/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-blue-400 font-semibold"
            >
              Switch Role / Auth
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
