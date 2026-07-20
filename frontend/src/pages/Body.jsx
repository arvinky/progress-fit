import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Activity, Plus, Trash2, Calendar, Layout, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Body() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [weekNumber, setWeekNumber] = useState(1);
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [calves, setCalves] = useState('');
  const [neck, setNeck] = useState('');
  const [note, setNote] = useState('');

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

  // Load measurements
  useEffect(() => {
    if (selectedClientId) {
      loadBodyData();
    }
  }, [selectedClientId]);

  async function loadBodyData() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracking/body/${selectedClientId}`);
      setMeasurements(res.data.measurements);
      // Auto-increment week number for convenience
      if (res.data.measurements.length > 0) {
        const lastWeek = res.data.measurements[res.data.measurements.length - 1].weekNumber;
        setWeekNumber(lastWeek + 1);
      } else {
        setWeekNumber(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveMeasurement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tracking/body/${selectedClientId}`, {
        weekNumber: parseInt(weekNumber),
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        arms: arms ? parseFloat(arms) : null,
        thighs: thighs ? parseFloat(thighs) : null,
        calves: calves ? parseFloat(calves) : null,
        neck: neck ? parseFloat(neck) : null,
        note
      });
      // Reset numeric inputs
      setChest('');
      setWaist('');
      setHips('');
      setArms('');
      setThighs('');
      setCalves('');
      setNeck('');
      setNote('');
      loadBodyData();
    } catch (error) {
      alert(t('bodyAddError'));
    }
  };

  const handleDelete = async (mId) => {
    if (!confirm(t('bodyDeleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/tracking/body/log/${mId}`);
      loadBodyData();
    } catch (error) {
      alert(t('bodyDeleteError'));
    }
  };

  // Compare first vs last
  const initial = measurements[0] || {};
  const current = measurements[measurements.length - 1] || {};

  const calculateDiff = (initialVal, currentVal) => {
    if (!initialVal || !currentVal) return null;
    const diff = currentVal - initialVal;
    return diff === 0 ? '0' : diff > 0 ? `+${diff.toFixed(1)} cm` : `${diff.toFixed(1)} cm`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('bodyTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('bodySubtitle')}</p>
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

      {loading && measurements.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Comparison Cards (Awal vs Sekarang) */}
          {measurements.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: t('chestName'), key: 'chest' },
                { label: t('waistName'), key: 'waist' },
                { label: t('hipsName'), key: 'hips' },
                { label: t('armsName'), key: 'arms' },
                { label: t('thighsName'), key: 'thighs' },
                { label: t('calvesName'), key: 'calves' },
                { label: t('neckName'), key: 'neck' },
              ].map((item, i) => {
                const diff = calculateDiff(initial[item.key], current[item.key]);
                return (
                  <div key={i} className="p-4 bg-slate-50 border border-card-border rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{item.label}</span>
                    <h4 className="text-lg font-bold text-text mt-1">{current[item.key] || '-'} cm</h4>
                    <span className={`block text-[10px] font-semibold mt-0.5 ${
                      diff?.startsWith('+') ? 'text-blue-600' : diff?.startsWith('-') ? 'text-accent' : 'text-text-muted'
                    }`}>
                      {diff || (language === 'id' ? 'tidak ada data' : 'no data')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>{t('bodyChartTitle')}</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={measurements} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorChest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWaist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="weekNumber" name={t('weekLabel')} label={{ value: t('weekNumberLabel'), position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" name={t('chestName')} dataKey="chest" stroke="#6366f1" fillOpacity={1} fill="url(#colorChest)" strokeWidth={2} />
                    <Area type="monotone" name={t('waistName')} dataKey="waist" stroke="#10b981" fillOpacity={1} fill="url(#colorWaist)" strokeWidth={2} />
                    <Area type="monotone" name={t('armsName')} dataKey="arms" stroke="#f97316" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Input Log Form */}
            <div className="glass rounded-3xl p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>{t('newBodyLogTitle')}</span>
              </h3>
              <form onSubmit={handleSaveMeasurement} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('weekNumberLabel')}</label>
                    <input
                      type="number"
                      required
                      value={weekNumber}
                      onChange={(e) => setWeekNumber(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('chestLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 100"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('waistLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 88"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('armsLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 35"
                      value={arms}
                      onChange={(e) => setArms(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('hipsLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 95"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('thighsLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 58"
                      value={thighs}
                      onChange={(e) => setThighs(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('leherLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 38"
                      value={neck}
                      onChange={(e) => setNeck(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('bodyNoteLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('bodyNotePlaceholder')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                >
                  {t('saveBodyBtn')}
                </button>
              </form>
            </div>
          </div>

          {/* Logs History Table */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{t('bodyHistoryTitle')}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-bold uppercase">
                    <th className="py-3 px-4">{t('weekLabel')}</th>
                    <th className="py-3 px-4">{t('chestName')}</th>
                    <th className="py-3 px-4">{t('waistName')}</th>
                    <th className="py-3 px-4">{t('hipsName')}</th>
                    <th className="py-3 px-4">{t('armsName')}</th>
                    <th className="py-3 px-4">{t('thighsName')}</th>
                    <th className="py-3 px-4">{t('neckName')}</th>
                    <th className="py-3 px-4">{t('note')}</th>
                    <th className="py-3 px-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 text-sm">
                  {measurements.slice().reverse().map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{t('weekLabel')} {m.weekNumber}</td>
                      <td className="py-3.5 px-4">{m.chest ? `${m.chest} cm` : '-'}</td>
                      <td className="py-3.5 px-4">{m.waist ? `${m.waist} cm` : '-'}</td>
                      <td className="py-3.5 px-4">{m.hips ? `${m.hips} cm` : '-'}</td>
                      <td className="py-3.5 px-4 font-semibold text-text">{m.arms ? `${m.arms} cm` : '-'}</td>
                      <td className="py-3.5 px-4">{m.thighs ? `${m.thighs} cm` : '-'}</td>
                      <td className="py-3.5 px-4">{m.neck ? `${m.neck} cm` : '-'}</td>
                      <td className="py-3.5 px-4 text-text-muted italic">{m.note || '-'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 hover:bg-danger/10 border border-transparent hover:border-danger/20 text-text-muted hover:text-danger rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


