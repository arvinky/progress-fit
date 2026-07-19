import React, { useState, useEffect } from 'react';
import useTranslation from '../../hooks/useTranslation';
import axios from 'axios';
import {
  Users,
  Scale,
  Calendar,
  Award,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalActive: 0,
    newThisMonth: 0,
    totalClients: 0,
    reachedTarget: 0,
    notCheckedIn: 0,
    todaySchedulesCount: 0,
  });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await axios.get(`${API_URL}/clients/dashboard-stats`);
        setStats(statsRes.data.stats);
        setTodaySchedules(statsRes.data.todaySchedules || []);

        const lbRes = await axios.get(`${API_URL}/leaderboard?category=weightLoss&period=monthly`);
        setLeaderboard(lbRes.data.leaderboard.slice(0, 5)); // top 5
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    {
      title: t('totalActiveClients'),
      value: `${stats.totalActive} / ${stats.totalClients}`,
      subtitle: 'Klien aktif vs total terdaftar',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      glow: 'shadow-blue-500/10',
    },
    {
      title: t('newClientsThisMonth'),
      value: stats.newThisMonth,
      subtitle: 'Bergabung di periode ini',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-500/10',
    },
    {
      title: t('reachedTargetCount'),
      value: stats.reachedTarget,
      subtitle: 'Berat badan ≤ target',
      icon: TargetIcon,
      color: 'from-purple-600 to-pink-600',
      glow: 'shadow-purple-500/10',
    },
    {
      title: t('missedCheckin'),
      value: stats.notCheckedIn,
      subtitle: 'Tidak ada sesi latihan ter-log',
      icon: AlertCircle,
      color: 'from-amber-600 to-red-600',
      glow: 'shadow-amber-500/10',
    },
  ];

  function TargetIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight">{t('adminDashTitle')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('adminDashSubtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-2xl glass hover-scale shadow-sm relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-[80px]`}></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{card.title}</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-text">{card.value}</h3>
                  <p className="text-xs text-text-muted mt-1.5">{card.subtitle}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jadwal Hari Ini */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{t('todaySchedule')}</span>
              </h3>
              <p className="text-xs text-text-muted">Daftar klien yang dijadwalkan latihan hari ini</p>
            </div>
            <Link
              to="/admin/schedules"
              className="text-xs text-accent font-bold hover:underline flex items-center gap-1"
            >
              <span>{t('allSchedules')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="h-48 flex flex-col justify-center items-center text-center p-6 border border-dashed border-card-border rounded-2xl">
              <Calendar className="w-8 h-8 text-text-muted mb-2 opacity-50" />
              <p className="text-sm font-medium text-text-muted">{t('noSchedulesToday')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todaySchedules.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-card-border rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-text">{s.clientName}</h4>
                    <p className="text-xs text-primary font-semibold mt-1">{s.program}</p>
                  </div>
                  <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase">
                    {s.day}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Ringkasan */}
        <div className="glass rounded-3xl p-6 border border-card-border/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span>{t('monthlyLeaderboard')}</span>
                </h3>
                <p className="text-xs text-text-muted">{t('weightLossCategory')}</p>
              </div>
              <Link to="/admin/leaderboard" className="p-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
                <Zap className="w-4 h-4 text-primary" />
              </Link>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">Belum ada data timbangan tercatat.</p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-600'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-600'
                            : idx === 2
                            ? 'bg-amber-700/20 text-amber-800'
                            : 'bg-slate-200 text-text-muted'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-text">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-accent">-{user.value} kg</span>
                      <span className="block text-[10px] text-text-muted">Turun</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/admin/leaderboard"
            className="w-full mt-6 py-3 px-4 bg-primary hover:bg-primary-hover text-white text-center rounded-xl text-xs font-bold transition-all block shadow-sm shadow-indigo-500/20"
          >
            {t('viewAllLeaderboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
