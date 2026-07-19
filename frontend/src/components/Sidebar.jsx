import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import {
  LayoutDashboard,
  Users,
  Scale,
  Activity,
  Calendar,
  History,
  TrendingUp,
  Award,
  Bell,
  LogOut,
  User,
  Heart,
  Target,
  Globe,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, client, logout } = useAuthStore();
  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/admin/clients', label: t('clientsData'), icon: Users },
    { to: '/admin/weight', label: t('weightMonitoring'), icon: Scale },
    { to: '/admin/body', label: t('bodyMeasurement'), icon: Activity },
    { to: '/admin/strength', label: t('strengthProgress'), icon: Award },
    { to: '/admin/workout-history', label: t('workoutHistory'), icon: History },
    { to: '/admin/schedules', label: t('workoutSplit'), icon: Calendar },
    { to: '/admin/daily-targets', label: t('dailyTarget'), icon: Target },
    { to: '/admin/cardio', label: t('cardioTracker'), icon: Heart },
    { to: '/admin/progress-charts', label: t('progressCharts'), icon: TrendingUp },
    { to: '/admin/reminders', label: t('reminders'), icon: Bell },
    { to: '/admin/leaderboard', label: t('leaderboard'), icon: Award },
  ];

  const clientLinks = [
    { to: '/client', label: t('myDashboard'), icon: LayoutDashboard },
    { to: '/client/weight', label: t('weightMonitoring'), icon: Scale },
    { to: '/client/body', label: t('bodyMeasurement'), icon: Activity },
    { to: '/client/strength', label: t('strengthProgress'), icon: Award },
    { to: '/client/workout-history', label: t('workoutHistory'), icon: History },
    { to: '/client/schedules', label: t('workoutSplit'), icon: Calendar },
    { to: '/client/daily-targets', label: t('dailyTarget'), icon: Target },
    { to: '/client/cardio', label: t('cardioTracker'), icon: Heart },
    { to: '/client/progress-charts', label: t('progressCharts'), icon: TrendingUp },
    { to: '/client/reminders', label: t('notifications'), icon: Bell },
    { to: '/client/leaderboard', label: t('leaderboard'), icon: Award },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : clientLinks;

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Navigation Drawer - Vibrant Colorful Sidebar */}
      <aside
        className={`w-64 bg-white text-slate-800 h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Close toggle */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center font-black text-sm text-white shadow-md shadow-slate-950/15">
              P
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-950">Progress</span>
              <span className="font-medium text-xl text-slate-600">Fit</span>
            </div>
          </div>
          {/* Mobile close cross button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin' || link.to === '/client'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group text-sm font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Language Switch and User Footer Profile */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* Language Switch Button */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 font-medium">
              <Globe className="w-4 h-4 text-indigo-650" />
              <span>Language / Bahasa</span>
            </div>
            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold rounded uppercase text-[10px]">
              {language === 'id' ? 'ID' : 'EN'}
            </span>
          </button>

          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-700 font-semibold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate text-slate-900">{user?.name}</h4>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role === 'ADMIN' ? 'Personal Trainer' : `${client?.program || 'Client'}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-sm font-semibold transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
