import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { KeyRound, Mail, AlertTriangle, Eye, EyeOff, Globe, User, Scale } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration additional states
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [program, setProgram] = useState('CUTTING');

  const [localError, setLocalError] = useState('');
  const { login, register, loading } = useAuthStore();
  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isRegister) {
      if (!name || !email || !password || !confirmPassword) {
        setLocalError(t('registerFieldsError'));
        return;
      }
      if (password !== confirmPassword) {
        setLocalError(language === 'id' ? 'Password konfirmasi tidak cocok.' : 'Passwords do not match.');
        return;
      }

      const res = await register({
        name,
        email,
        password,
        role: 'CLIENT',
        age: parseInt(age) || 25,
        height: parseFloat(height) || 170,
        initialWeight: parseFloat(weight) || 70,
        targetWeight: parseFloat(targetWeight) || 65,
        program
      });

      if (res.success) {
        navigate('/client');
      } else {
        setLocalError(res.error);
      }
    } else {
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Subtle top background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Dynamic top language toggle switcher */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm z-20"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span>{language === 'id' ? 'ID' : 'EN'}</span>
      </button>

      {/* Brand logo header - Modern Black Logo */}
      <div className="mb-6 sm:mb-8 flex items-center gap-3.5 text-center select-none z-10 animate-fade-in">
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

      {/* Auth Card (Wider if Registering to look clean on desktop) */}
      <div className={`w-full ${isRegister ? 'max-w-xl' : 'max-w-md'} bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60 z-10 relative transition-all duration-350`}>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? t('registerTitle') : t('loginTitle')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? t('registerSubtitle') : t('loginSubtitle')}
          </p>
        </div>

        {localError && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-150 text-red-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-650" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: Account credentials */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('nameLabel')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-150"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-150"
              />
            </div>
          </div>

          <div className={`${isRegister ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('passwordLabel')}</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-150"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Physical Specifications (Only for Registration) */}
          {isRegister && (
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block">
                {language === 'id' ? 'Spesifikasi Fisik & Program' : 'Physical Specs & Program'}
              </span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('registerAgeLabel')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none transition-all duration-150"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('registerHeightLabel')}</label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="300"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('registerWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="10"
                    max="500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none transition-all duration-150"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('registerTargetWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="10"
                    max="500"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none transition-all duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('registerProgramLabel')}</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-950 text-sm focus:outline-none transition-all duration-150 font-semibold"
                >
                  <option value="CUTTING">Cutting (Fat Loss)</option>
                  <option value="BULKING">Bulking (Muscle Gain)</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-slate-950/15 transition-all text-sm mt-3"
          >
            {loading ? t('loading') : (isRegister ? t('registerBtn') : t('loginBtn'))}
          </button>
        </form>

        {/* Toggle Mode Option */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={handleToggleMode}
            className="text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-all hover:underline"
          >
            {isRegister ? t('hasAccount') : t('noAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
