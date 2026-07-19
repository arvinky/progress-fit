import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import useTranslation from '../../hooks/useTranslation';
import {
  Calendar,
  Award,
  Bell,
  Scale,
  Activity,
  Heart,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ClientDashboard() {
  const { user, client } = useAuthStore();
  const { t } = useTranslation();

  // State
  const [weightLogs, setWeightLogs] = useState([]);
  const [weeklyCardio, setWeeklyCardio] = useState({ totalDuration: 0 });
  const [schedules, setSchedules] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client) {
      loadDashboardData();
    }
  }, [client]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // 1. Weight Logs
      const wRes = await axios.get(`${API_URL}/tracking/weight/${client.id}`);
      setWeightLogs(wRes.data.logs);

      // 2. Weekly Cardio
      const cRes = await axios.get(`${API_URL}/tracking/cardio/${client.id}`);
      setWeeklyCardio(cRes.data.weeklyStats || { totalDuration: 0 });

      // 3. Today's Schedules
      const sRes = await axios.get(`${API_URL}/workout/schedules/${client.id}`);
      setSchedules(sRes.data.schedules);

      // 4. Unread Reminders
      const rRes = await axios.get(`${API_URL}/reminders?status=UNREAD`);
      setReminders(rRes.data.reminders);

      // 5. Daily Targets
      const tRes = await axios.get(`${API_URL}/tracking/targets/${client.id}`);
      setTargets(tRes.data.targets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Weight Progress Calculations
  const initialWeight = client?.initialWeight || 0;
  const targetWeight = client?.targetWeight || 0;
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : initialWeight;
  const weightProgress = Math.abs(initialWeight - currentWeight).toFixed(1);

  // Today Schedule Split Finder
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDay = days[new Date().getDay()];
  const todaySchedule = schedules.find((s) => s.dayOfWeek === todayDay && s.isActive);

  // Daily target check
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTarget = targets.find(
    (t) => new Date(t.date).toISOString().split('T')[0] === todayStr
  );
  const checklistCheckedCount = todayTarget
    ? [todayTarget.workoutDone, todayTarget.proteinMet, todayTarget.waterMet, todayTarget.sleepMet, todayTarget.stepsMet].filter(Boolean).length
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">{t('clientDashTitle', { name: user?.name })}</h1>
          <p className="text-sm text-text-muted mt-1">{t('clientDashSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
            {t('programLabel')}: {client?.program}
          </span>
        </div>
      </div>

      {/* Main Widgets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Widget 1: Weight */}
        <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-5 rounded-bl-[80px]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('weight')}</p>
              <h3 className="text-2xl font-extrabold mt-2 text-text">{currentWeight} kg</h3>
              <p className="text-xs text-text-muted mt-1.5">{t('target')} {t('current') !== 'Sekarang' ? 'Target' : 'Target'} Anda: {targetWeight} kg</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <Scale className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Widget 2: Weekly Cardio */}
        <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-5 rounded-bl-[80px]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('weeklyCardioTitle')}</p>
              <h3 className="text-2xl font-extrabold mt-2 text-text">
                {weeklyCardio.totalDuration || 0} Menit
              </h3>
              <p className="text-xs text-text-muted mt-1.5">{t('cardioTarget')}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <Heart className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>

        {/* Widget 3: Today's target check status */}
        <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-5 rounded-bl-[80px]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('routineChecklist')}</p>
              <h3 className="text-2xl font-extrabold mt-2 text-text">{checklistCheckedCount} / 5 {t('target')}</h3>
              <p className="text-xs text-text-muted mt-1.5">{t('quickChecklistSubtitle').split('.')[0]}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
              <CheckCircle2 className="w-5 h-5 text-violet-500" />
            </div>
          </div>
        </div>

        {/* Widget 4: Reminders notification */}
        <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-5 rounded-bl-[80px]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('notifications')}</p>
              <h3 className="text-2xl font-extrabold mt-2 text-text">{reminders.length} Notifikasi</h3>
              <p className="text-xs text-text-muted mt-1.5">{t('coachNotification')}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 relative">
              <Bell className="w-5 h-5 text-warning" />
              {reminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-ping"></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Span: Split Program & Daily checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's training split */}
          <div className="glass rounded-3xl p-6 border border-card-border/80 relative overflow-hidden">
            <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{t('todayWorkoutSplit')}</span>
            </h3>

            {todaySchedule ? (
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <span className="text-[10px] font-black text-primary uppercase bg-white border border-indigo-100 px-2 py-0.5 rounded-lg">
                  {t('workoutSplit')}
                </span>
                <h4 className="text-xl font-extrabold mt-2 text-text">{todaySchedule.programName}</h4>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">{todaySchedule.description || t('restDaySubtitle')}</p>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-card-border/60 rounded-2xl text-center">
                <Calendar className="w-8 h-8 text-text-muted opacity-40 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-text-muted">{t('restDayTitle')}</h4>
                <p className="text-xs text-text-muted mt-0.5">{t('restDaySubtitle')}</p>
              </div>
            )}
          </div>

          {/* Quick Checklist Button */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-text">{t('routineChecklist')}</h3>
                <p className="text-xs text-text-muted">{t('quickChecklistSubtitle')}</p>
              </div>
              <Link
                to="/client/daily-targets"
                className="text-xs text-accent font-bold hover:underline flex items-center gap-1"
              >
                <span>{t('fullTargetLink')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Checklist elements preview */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('workoutChecklistLabel'), state: todayTarget?.workoutDone, color: 'text-indigo-600' },
                { label: t('proteinChecklistLabel'), state: todayTarget?.proteinMet, color: 'text-danger' },
                { label: t('waterChecklistLabel'), state: todayTarget?.waterMet, color: 'text-blue-500' },
                { label: t('sleepChecklistLabel'), state: todayTarget?.sleepMet, color: 'text-violet-500' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                    item.state ? 'bg-emerald-50 border-emerald-100 text-emerald-950 font-bold' : 'bg-white border-card-border/60 text-text-muted'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    item.state ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-card-border bg-white'
                  }`}>
                    {item.state && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Span: Notifications box preview */}
        <div className="glass rounded-3xl p-6 border border-card-border/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text">{t('coachNotification')}</h3>
              <Link to="/client/reminders" className="text-xs text-accent font-bold hover:underline">
                {t('notifications')}
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-16 text-xs text-text-muted italic">
                {t('noCoachNotification')}
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.slice(0, 3).map((rem) => (
                  <div key={rem.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-xs font-extrabold text-text block">{rem.title}</span>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{rem.message}</p>
                    <span className="text-[10px] text-text-muted block pt-1">
                      {new Date(rem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/client/progress-charts"
            className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-xl text-xs font-extrabold transition-all block shadow-lg shadow-indigo-600/15"
          >
            {t('viewMyProgressReport')}
          </Link>
        </div>
      </div>
    </div>
  );
}
