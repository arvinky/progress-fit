import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { KeyRound, Mail, AlertTriangle, Eye, EyeOff, Globe } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, loading } = useAuthStore();
  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError(t('loginFieldsError'));
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } else {
      setLocalError(res.error);
    }
  };

  const autofill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden px-4 py-12">
      {/* Subtle top background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Dynamic top language toggle switcher */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span>{language === 'id' ? 'ID' : 'EN'}</span>
      </button>

      {/* Brand logo header - Modern Black Logo */}
      <div className="mb-8 flex items-center gap-3.5 text-center select-none z-10 animate-fade-in">
        <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-slate-950/20">
          P
        </div>
        <div className="text-left">
          <div className="flex items-baseline">
            <span className="font-extrabold text-2xl tracking-tight text-slate-950">Progress</span>
            <span className="font-medium text-2xl text-slate-600">Fit</span>
          </div>
          <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400 mt-0.5">
            {t('loginSubHeader')}
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60 z-10 relative">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('loginTitle')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('loginSubtitle')}</p>
        </div>

        {localError && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-150 text-red-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-650" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('passwordLabel')}</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-slate-950/15 transition-all text-sm mt-3"
          >
            {loading ? t('loading') : t('loginBtn')}
          </button>
        </form>

        {/* Demo Credentials Auto Fill */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">{t('demoAccount')}</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => autofill('admin@progressfit.com', 'admin123')}
              className="group py-2.5 px-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all hover:scale-[1.02]"
            >
              <span className="font-bold text-indigo-650 group-hover:text-indigo-700 transition-colors block text-xs">{t('coachDemo')}</span>
              <span className="text-slate-500 text-[10px] block truncate mt-0.5">admin@progressfit.com</span>
            </button>
            <button
              onClick={() => autofill('arvin@gmail.com', 'client123')}
              className="group py-2.5 px-3 bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 rounded-xl text-left transition-all hover:scale-[1.02]"
            >
              <span className="font-bold text-amber-600 group-hover:text-amber-700 transition-colors block text-xs">{t('clientDemo')}</span>
              <span className="text-slate-500 text-[10px] block truncate mt-0.5">arvin@gmail.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
