import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Super Admin authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Lighting Orbs */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS Control Plane</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 mx-auto flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-amber-500/25 ring-4 ring-amber-500/10 transition-transform duration-300 hover:scale-105">
            GX
          </div>

          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 tracking-tight">
              GuardianX Super Admin
            </h1>
            <p className="text-sm text-slate-400 mt-1">Multi-Tenant Platform Governance & Infrastructure</p>
          </div>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-8 shadow-2xl shadow-amber-950/30 transition-all duration-300">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Super Admin Email
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@guardianx.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Super Admin Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <span>Access Control Plane</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted endpoint. Authorized Super Admin personnel only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

