import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Scale, Activity, Award, BarChart3, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ProgressCharts() {
  const { user, client: authClient } = useAuthStore();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [timeframe, setTimeframe] = useState('monthly'); // weekly, monthly, yearly
  const [loading, setLoading] = useState(false);

  // Data State
  const [weightLogs, setWeightLogs] = useState([]);
  const [bodyLogs, setBodyLogs] = useState([]);
  const [strengthLogs, setStrengthLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);

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

  // Load all tracking data
  useEffect(() => {
    if (selectedClientId) {
      loadChartData();
    }
  }, [selectedClientId, timeframe]);

  async function loadChartData() {
    setLoading(true);
    try {
      // 1. Weight
      const weightRes = await axios.get(`${API_URL}/tracking/weight/${selectedClientId}`);
      setWeightLogs(weightRes.data.logs);

      // 2. Body
      const bodyRes = await axios.get(`${API_URL}/tracking/body/${selectedClientId}`);
      setBodyLogs(bodyRes.data.measurements);

      // 3. PR/Strength
      const prRes = await axios.get(`${API_URL}/workout/pr/${selectedClientId}`);
      setStrengthLogs(prRes.data.allRecords);

      // 4. Workout volume & sessions frequency
      const sessRes = await axios.get(`${API_URL}/workout/sessions/${selectedClientId}`);
      setWorkoutLogs(sessRes.data.sessions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Format data for charts
  const formattedWeightData = weightLogs.map((log) => ({
    date: new Date(log.loggedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    berat: log.weight
  }));

  const formattedBodyData = bodyLogs.map((log) => ({
    week: `Mng ${log.weekNumber}`,
    chest: log.chest,
    waist: log.waist,
    arms: log.arms,
    thighs: log.thighs
  }));

  // Strength PRs over time
  // Group by date to show progress
  const formattedStrengthData = strengthLogs.reduce((acc, log) => {
    const dateStr = new Date(log.achievedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    let existing = acc.find((item) => item.date === dateStr);
    if (!existing) {
      existing = { date: dateStr };
      acc.push(existing);
    }
    existing[log.exerciseName] = log.weight;
    return acc;
  }, []);

  const formattedWorkoutData = workoutLogs.slice().reverse().map((sess) => ({
    date: new Date(sess.startTime).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    volume: sess.totalVolume || 0,
    duration: sess.durationMin || 0
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('chartsTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('chartsSubtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Client Selector (Admin Only) */}
          {isAdmin && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-primary font-bold shadow-sm"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-200 border border-slate-300 p-1 rounded-xl">
            {['weekly', 'monthly', 'yearly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-300 hover:text-slate-900'
                }`}
              >
                {tf === 'weekly' ? t('weeklyLabel') : tf === 'monthly' ? t('monthlyLabel') : t('yearlyLabel')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Charts Grid Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Weight Progression */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-6">
              <Scale className="w-4 h-4 text-primary" />
              <span>Progress Berat Badan</span>
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedWeightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="berat" name="Berat (kg)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Body Measurements */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-accent" />
              <span>Progress Ukuran Lingkar Tubuh</span>
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedBodyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="chest" name="Dada" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="waist" name="Pinggang" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="arms" name="Lengan" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Strength PR load progression */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span>Kenaikan Angkatan Beban (Strength Records)</span>
            </h3>
            {formattedStrengthData.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-20">Belum ada PR latihan yang tercatat.</p>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedStrengthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" connectNulls dataKey="Bench Press" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" connectNulls dataKey="Squat" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" connectNulls dataKey="Deadlift" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 4: Volume & Frequency */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>Volume Latihan Sesi</span>
            </h3>
            {formattedWorkoutData.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-20">Belum ada riwayat sesi latihan.</p>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedWorkoutData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                    <Bar dataKey="volume" name="Volume Beban (kg)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


