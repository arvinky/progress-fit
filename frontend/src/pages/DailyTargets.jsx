import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Target, CheckCircle2, Dumbbell, GlassWater, Moon, Footprints, Flame, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DailyTargets() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [targets, setTargets] = useState([]);
  const [complianceRate, setComplianceRate] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State - Today's target check status
  const [workoutDone, setWorkoutDone] = useState(false);
  const [proteinMet, setProteinMet] = useState(false);
  const [waterMet, setWaterMet] = useState(false);
  const [sleepMet, setSleepMet] = useState(false);
  const [stepsMet, setStepsMet] = useState(false);
  const [stepsCount, setStepsCount] = useState('');
  const [waterLiters, setWaterLiters] = useState('');
  const [sleepHours, setSleepHours] = useState('');

  // Load clients if Admin
  useEffect(() => {
    if (isAdmin) {
      axios.get(`${API_URL}/clients?isActive=true`).then((res) => {
        setClients(res.data.clients);
        if (res.data.clients.length > 0) {
          setSelectedClientId(res.data.clients[0].id);
        }
      });
    } else if (authClient) {
      setSelectedClientId(authClient.id);
    }
  }, [isAdmin, authClient]);

  // Load compliance checklist
  useEffect(() => {
    if (selectedClientId) {
      loadTargetsData();
    }
  }, [selectedClientId]);

  async function loadTargetsData() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracking/targets/${selectedClientId}`);
      setTargets(res.data.targets);
      setComplianceRate(res.data.complianceRate);

      // Find today's target if exists to load form values
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTarget = res.data.targets.find(
        (t) => new Date(t.date).toISOString().split('T')[0] === todayStr
      );

      if (todayTarget) {
        setWorkoutDone(todayTarget.workoutDone);
        setProteinMet(todayTarget.proteinMet);
        setWaterMet(todayTarget.waterMet);
        setSleepMet(todayTarget.sleepMet);
        setStepsMet(todayTarget.stepsMet);
        setStepsCount(todayTarget.stepsCount || '');
        setWaterLiters(todayTarget.waterLiters || '');
        setSleepHours(todayTarget.sleepHours || '');
      } else {
        // Reset Today Form
        setWorkoutDone(false);
        setProteinMet(false);
        setWaterMet(false);
        setSleepMet(false);
        setStepsMet(false);
        setStepsCount('');
        setWaterLiters('');
        setSleepHours('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveToday = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await axios.post(`${API_URL}/tracking/targets/${selectedClientId}/${todayStr}`, {
        workoutDone,
        proteinMet,
        waterMet,
        sleepMet,
        stepsMet,
        stepsCount: stepsCount ? parseInt(stepsCount) : null,
        waterLiters: waterLiters ? parseFloat(waterLiters) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null
      });
      loadTargetsData();
      alert(t('dailyTargetSaveSuccess'));
    } catch (error) {
      alert(t('dailyTargetSaveError'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">{t('dailyTargetTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('dailyTargetSubtitle')}</p>
        </div>

        {/* Action Selector */}
        {isAdmin && (
          <div className="w-full sm:w-64">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600 font-bold shadow-sm"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && targets.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Compliance Meter */}
          <div className="p-6 rounded-3xl glass border border-card-border/80 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-extrabold text-text">{t('complianceTitle')}</h3>
              <p className="text-xs text-text-muted">{t('complianceSubtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-slate-100 fill-none" strokeWidth="8" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-accent fill-none transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - complianceRate / 100)}
                  />
                </svg>
                <span className="absolute text-xl font-black text-text">{complianceRate}%</span>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-accent">{t('complianceCategory')}</span>
                <h4 className="text-lg font-bold text-text">
                  {complianceRate >= 90 ? t('complianceAwesome') : complianceRate >= 75 ? t('complianceGood') : t('complianceWarning')}
                </h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checklist form */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>{t('todayChecklistTitle')}</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{t('todayChecklistSubtitle')}</p>
              </div>

              <form onSubmit={handleSaveToday} className="space-y-6">
                {/* 4 checklist rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: t('workoutChecklistLabel'), state: workoutDone, setState: setWorkoutDone, icon: Dumbbell, color: 'text-slate-800' },
                    { label: t('proteinChecklistLabel'), state: proteinMet, setState: setProteinMet, icon: Flame, color: 'text-danger' },
                    { label: t('waterChecklistLabel'), state: waterMet, setState: setWaterMet, icon: GlassWater, color: 'text-blue-500' },
                    { label: t('sleepChecklistLabel'), state: sleepMet, setState: setSleepMet, icon: Moon, color: 'text-indigo-500' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => item.setState(!item.state)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          item.state
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                            : 'bg-white border-card-border/60 text-text-muted hover:border-slate-355'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          item.state ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-card-border bg-white'
                        }`}>
                          {item.state && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Steps Checklist Card */}
                  <button
                    type="button"
                    onClick={() => setStepsMet(!stepsMet)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all sm:col-span-2 ${
                      stepsMet
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                        : 'bg-white border-card-border/60 text-text-muted hover:border-slate-355'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Footprints className="w-5 h-5 text-emerald-650" />
                      <span className="text-sm font-semibold">{t('stepsChecklistLabel')}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      stepsMet ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-card-border bg-white'
                    }`}>
                      {stepsMet && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                </div>

                {/* Optional Numeric Inputs */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-card-border/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('totalStepsLabel')}</label>
                    <input
                      type="number"
                      placeholder="e.g. 10400"
                      value={stepsCount}
                      onChange={(e) => setStepsCount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('waterLitersLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.2"
                      value={waterLiters}
                      onChange={(e) => setWaterLiters(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('sleepHoursLabel')}</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 text-sm"
                >
                  {t('saveTodayReportBtn')}
                </button>
              </form>
            </div>

            {/* Compliance Feed Log (Admin/PT view) */}
            <div className="glass rounded-3xl p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                <span>{t('complianceCheckinHistoryTitle')}</span>
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {targets.map((tgt, i) => {
                  const complCount = [tgt.workoutDone, tgt.proteinMet, tgt.waterMet, tgt.sleepMet, tgt.stepsMet].filter(Boolean).length;
                  
                  let cardBg = 'bg-slate-50 border-slate-200';
                  let badgeBg = 'bg-slate-500 text-white';
                  if (complCount === 5) {
                    cardBg = 'bg-emerald-50/60 border-emerald-200/50';
                    badgeBg = 'bg-emerald-600 text-white';
                  } else if (complCount >= 3) {
                    cardBg = 'bg-indigo-50/50 border-indigo-200/40';
                    badgeBg = 'bg-indigo-600 text-white';
                  } else {
                    cardBg = 'bg-red-50/30 border-red-200/30';
                    badgeBg = 'bg-red-650 text-white';
                  }

                  return (
                    <div key={i} className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all ${cardBg}`}>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">
                          {new Date(tgt.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex gap-1.5 mt-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${tgt.workoutDone ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${tgt.proteinMet ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${tgt.waterMet ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${tgt.sleepMet ? 'bg-purple-500' : 'bg-slate-400'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${tgt.stepsMet ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase ${badgeBg}`}>
                        {t('targetAchievedCount').replace('{count}', complCount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
