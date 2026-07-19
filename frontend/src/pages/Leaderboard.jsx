import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Award, Zap, Heart, Calendar, Scale, ShieldAlert, Sparkles, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Leaderboard() {
  const { user: authUser } = useAuthStore();
  const { t } = useTranslation();
  const isClient = authUser?.role === 'CLIENT';

  // Filters State
  const [category, setCategory] = useState('weightLoss'); // weightLoss, benchPress, squat, streak, cardio, attendance
  const [period, setPeriod] = useState('monthly'); // weekly, monthly, yearly
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [category, period]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leaderboard`, {
        params: { category, period }
      });
      setBoard(res.data.leaderboard);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { id: 'weightLoss', label: t('leaderboardWeightLoss'), icon: Scale },
    { id: 'benchPress', label: t('leaderboardBenchPress'), icon: Award },
    { id: 'squat', label: t('leaderboardSquat'), icon: Award },
    { id: 'streak', label: t('leaderboardStreak'), icon: Zap },
    { id: 'cardio', label: t('leaderboardCardio'), icon: Heart },
    { id: 'attendance', label: t('leaderboardAttendance'), icon: Calendar },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('leaderboardTitle')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('leaderboardSubtitle')}</p>
      </div>

      {/* Categories select tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-card-border/60">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 border border-card-border rounded-2xl">
        <span className="text-xs font-bold text-text-muted flex items-center gap-1">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>{t('timeframeLabel')}</span>
        </span>
        <div className="flex items-center w-full sm:w-auto gap-1 bg-slate-200 p-1 rounded-xl border border-slate-350">
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all text-center ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-300 hover:text-slate-950'
              }`}
            >
              {p === 'weekly' ? t('weeklyLabelLeaderboard') : p === 'monthly' ? t('monthlyLabelLeaderboard') : t('yearlyLabelLeaderboard')}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass rounded-3xl overflow-hidden border border-card-border/80 max-w-3xl mx-auto">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : board.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm italic">
            {t('noLeaderboardData')}
          </div>
        ) : (
          <div className="divide-y divide-card-border/60">
            {board.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 flex items-center justify-between transition-all ${
                  item.isCurrentUser
                    ? 'bg-blue-50 border-y border-blue-100'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* User info & Rank */}
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/20 text-amber-600'
                        : idx === 1
                        ? 'bg-slate-400/20 border-slate-400/20 text-slate-600'
                        : idx === 2
                        ? 'bg-amber-700/20 border-amber-700/20 text-amber-800'
                        : 'bg-slate-200 border-card-border text-slate-700'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <span className="font-extrabold text-sm text-text flex items-center gap-1.5">
                      {item.name}
                      {item.isCurrentUser && (
                        <span className="px-1.5 py-0.5 bg-blue-100 border border-blue-200 text-blue-600 text-[9px] font-black rounded uppercase">
                          {t('youLabel')}
                        </span>
                      )}
                    </span>
                    <span className="block text-[10px] text-text-muted mt-0.5">{item.details}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-base font-black text-accent">
                    {item.value} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Private client view note */}
      {isClient && (
        <div className="max-w-3xl mx-auto p-4 bg-slate-50 border border-card-border rounded-2xl text-[11px] text-text-muted flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('privacyNote')}
          </p>
        </div>
      )}
    </div>
  );
}


