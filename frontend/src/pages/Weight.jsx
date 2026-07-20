import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Scale, Plus, Trash2, Calendar, Target, TrendingDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Weight() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);
  const [initialWeight, setInitialWeight] = useState(0);
  const [targetWeight, setTargetWeight] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().split('T')[0]);

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

  // Load weight logs when selected client changes
  useEffect(() => {
    if (selectedClientId) {
      loadWeightData();
    }
  }, [selectedClientId]);

  async function loadWeightData() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracking/weight/${selectedClientId}`);
      setWeightLogs(res.data.logs);
      setInitialWeight(res.data.initialWeight);
      setTargetWeight(res.data.targetWeight);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!weight) return;

    try {
      await axios.post(`${API_URL}/tracking/weight/${selectedClientId}`, {
        weight: parseFloat(weight),
        note,
        loggedAt: new Date(loggedAt)
      });
      setWeight('');
      setNote('');
      loadWeightData();
    } catch (error) {
      alert(language === 'id' ? 'Gagal menambahkan log berat badan.' : 'Failed to add body weight log.');
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm(language === 'id' ? 'Hapus log berat badan ini?' : 'Delete this weight log?')) return;
    try {
      await axios.delete(`${API_URL}/tracking/weight/log/${logId}`);
      loadWeightData();
    } catch (error) {
      alert(language === 'id' ? 'Gagal menghapus log.' : 'Failed to delete weight log.');
    }
  };

  // Calculations
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : initialWeight;
  const progressKg = (initialWeight - currentWeight).toFixed(1);
  const progressPercent = initialWeight > 0 ? (((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100).toFixed(0) : 0;

  // Chart Formatting
  const chartData = weightLogs.map((log) => ({
    date: new Date(log.loggedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }),
    berat: log.weight,
    target: targetWeight,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('weightTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('weightSubtitle')}</p>
        </div>

        {/* Client Selector (Admin Only) */}
        {isAdmin && (
          <div className="w-full sm:w-64">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-primary font-bold shadow-sm"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.program})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && weightLogs.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-[60px]"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('initialWeightCard')}</p>
              <h3 className="text-3xl font-extrabold mt-2 text-text">{initialWeight} kg</h3>
              <p className="text-xs text-text-muted mt-1">{language === 'id' ? 'Timbangan awal mendaftar' : 'Initial registered weight'}</p>
            </div>
            <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-[60px]"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('currentWeightCard')}</p>
              <h3 className="text-3xl font-extrabold mt-2 text-accent">{currentWeight} kg</h3>
              <p className="text-xs text-text-muted mt-1">{t('lastRecorded')}</p>
            </div>
            <div className="p-6 rounded-2xl glass border border-card-border/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-bl-[60px]"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('targetWeightCard')}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-extrabold text-text">{targetWeight} kg</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  parseFloat(progressKg) >= 0 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                }`}>
                  {parseFloat(progressKg) >= 0 ? `-${progressKg} kg` : `+${Math.abs(progressKg)} kg`}
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-text-muted mt-1">
                {language === 'id' ? `Progress target: ${progressPercent}% tercapai` : `Target progress: ${progressPercent}% achieved`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="order-2 lg:order-1 lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-indigo-600" />
                <span>{t('weightChartTitle')}</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <ReferenceLine y={targetWeight} stroke="#f97316" strokeDasharray="3 3" label={{ value: language === 'id' ? 'Target' : 'Target', fill: '#f97316', fontSize: 10, position: 'top' }} />
                    <Line type="monotone" dataKey="berat" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Input Log Form */}
            <div className="order-1 lg:order-2 glass rounded-3xl p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>{t('newLogTitle')}</span>
              </h3>
              <form onSubmit={handleAddLog} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('weightInputLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder={language === 'id' ? 'Contoh: 72.5' : 'Example: 72.5'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('logDateLabel')}</label>
                  <input
                    type="date"
                    required
                    value={loggedAt}
                    onChange={(e) => setLoggedAt(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('optionalNoteLabel')}</label>
                  <textarea
                    placeholder={language === 'id' ? 'Kondisi tubuh, rasa lapar, dll...' : 'Body condition, hunger level, etc...'}
                    rows="2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none resize-none focus:border-indigo-650"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                >
                  {t('saveWeightBtn')}
                </button>
              </form>
            </div>
          </div>

          {/* Logs History Table */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{t('weightHistoryTitle')}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-bold uppercase">
                    <th className="py-3 px-4">{t('historyDateTh')}</th>
                    <th className="py-3 px-4">{t('historyWeightTh')}</th>
                    <th className="py-3 px-4">{t('historyDiffTh')}</th>
                    <th className="py-3 px-4">{t('historyNoteTh')}</th>
                    <th className="py-3 px-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 text-sm">
                  {weightLogs.slice().reverse().map((log) => {
                    const diff = (initialWeight - log.weight).toFixed(1);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-all">
                        <td className="py-3.5 px-4 font-medium text-text-muted">
                          {new Date(log.loggedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-text">{log.weight} kg</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            parseFloat(diff) >= 0 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                          }`}>
                            {parseFloat(diff) >= 0 ? `-${diff} kg` : `+${Math.abs(diff)} kg`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-text-muted italic">{log.note || '-'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 hover:bg-danger/10 border border-transparent hover:border-danger/20 text-text-muted hover:text-danger rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


