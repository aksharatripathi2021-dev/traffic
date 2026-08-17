import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CitizenLoginPage: React.FC = () => {
  const [fullName, setFullName] = useState('Aniket Deshmukh');
  const [emailId, setEmailId] = useState('aniket.deshmukh@nagpur.gov.in');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !emailId.trim()) {
      setErrorMsg('Please enter both Full Name and Email ID to proceed.');
      return;
    }

    if (!emailId.includes('@')) {
      setErrorMsg('Please enter a valid Email ID address.');
      return;
    }

    setErrorMsg('');
    localStorage.setItem('nirnay_user_role', 'citizen');
    localStorage.setItem('nirnay_citizen_name', fullName.trim());
    localStorage.setItem('nirnay_citizen_email', emailId.trim());
    navigate('/citizen/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/10">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Citizen Portal Sign In</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your details to access Nagpur live traffic risk map and incident reporting system.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aniket Deshmukh"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email ID</span>
            </label>
            <input
              type="email"
              required
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="e.g. aniket@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-blue-600/20 font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue as Citizen
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link to="/police/login" className="text-xs text-slate-400 hover:text-amber-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Are you a Police Officer? Sign in to Police Command →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
