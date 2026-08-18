import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { API_BASE } from '../../utils/api';

export const PoliceLoginPage: React.FC = () => {
  const [username, setUsername] = useState('demo_police');
  const [password, setPassword] = useState('nirnay2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Username and Password to proceed.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Invalid username or password.');
      }

      const data = await res.json();
      localStorage.setItem('nirnay_token', data.access_token);
      localStorage.setItem('nirnay_user_role', 'police');
      localStorage.setItem('nirnay_police_name', data.username || 'Inspector Nagpur');
      localStorage.setItem('nirnay_police_badge', 'NGP-0054');
      
      navigate('/police/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Police Command Sign In</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nagpur Traffic Police Department — Authorized Tactical Command Center Access
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
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. demo_police"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="warning"
            size="lg"
            className="w-full shadow-lg shadow-amber-600/20 font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'CONTINUE AS POLICE'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link to="/citizen/login" className="text-xs text-slate-400 hover:text-blue-400 font-medium flex items-center justify-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Switch to Public Citizen Portal →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
