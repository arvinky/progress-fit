import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Heart, Plus, Trash2, Calendar, Flame, Timer, Compass, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Cardio() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cardioLogs, setCardioLogs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalDuration: 0,
    totalDistance: 0,
    totalCalories: 0,
    sessions: 0
  });
  const [loading, setLoading] = useState(false);

  // Form State
  const [cardioType, setCardioType] = useState('RUN');
  const [durationMin, setDurationMin] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
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

  // Load cardio logs
  useEffect(() => {
    if (selectedClientId) {
      loadCardioData();
    }
  }, [selectedClientId]);

  async function loadCardioData() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracking/cardio/${selectedClientId}`);
      setCardioLogs(res.data.logs);
      setWeeklyStats(res.data.weeklyStats || {
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0,
        sessions: 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddCardio = async (e) => {
    e.preventDefault();
    if (!durationMin) return;

    try {
      await axios.post(`${API_URL}/tracking/cardio/${selectedClientId}`, {
        cardioType,
        durationMin: parseInt(durationMin),
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        calories: calories ? parseInt(calories) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        note,
        loggedAt: new Date(loggedAt)
      });
      // Reset Form
      setDurationMin('');
      setDistanceKm('');
      setCalories('');
      setHeartRate('');
      setNote('');
      loadCardioData();
    } catch (error) {
      alert(t('cardioAddError'));
    }
  };

  const handleDeleteCardio = async (logId) => {
    if (!confirm(t('cardioDeleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/tracking/cardio/log/${logId}`);
      loadCardioData();
    } catch (error) {
      alert(t('cardioDeleteError'));
    }
  };

  const getCardioTypeTranslation = (type) => {
    const keyMap = {
      WALK: 'cardioWalk',
      RUN: 'cardioRun',
      BIKE: 'cardioBike',
      STAIRMASTER: 'cardioStairmaster',
      SWIM: 'cardioSwim',
      OTHER: 'cardioOther'
    };
    return t(keyMap[type] || 'cardioOther');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('cardioTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('cardioSubtitle')}</p>
        </div>

        {/* Client Selector (Admin Only) */}
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

      {loading && cardioLogs.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Weekly Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-3 sm:p-5 rounded-2xl glass border border-card-border/60 relative overflow-hidden flex items-center gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('cardioDurationCard')}</span>
                <h3 className="text-2xl font-black mt-0.5 text-text">
                  {t('minutesCountLabel').replace('{count}', weeklyStats.totalDuration)}
                </h3>
              </div>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl glass border border-card-border/60 relative overflow-hidden flex items-center gap-3">
              <div className="p-3.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('cardioDistanceCard')}</span>
                <h3 className="text-2xl font-black mt-0.5 text-text">{weeklyStats.totalDistance.toFixed(1)} km</h3>
              </div>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl glass border border-card-border/60 relative overflow-hidden flex items-center gap-3">
              <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('cardioCaloriesCard')}</span>
                <h3 className="text-2xl font-black mt-0.5 text-text">{weeklyStats.totalCalories} kcal</h3>
              </div>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl glass border border-card-border/60 relative overflow-hidden flex items-center gap-3">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('cardioSessionsCard')}</span>
                <h3 className="text-2xl font-black mt-0.5 text-text">
                  {t('sessionsCountLabel').replace('{count}', weeklyStats.sessions)}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cardio logs feed */}
            <div className="order-2 lg:order-1 lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80 space-y-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>{t('cardioHistoryTitle')}</span>
              </h3>

              {cardioLogs.length === 0 ? (
                <div className="py-16 text-center text-text-muted text-sm italic">
                  {t('cardioEmptyHistory')}
                </div>
              ) : (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {cardioLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-650 border border-blue-100 text-[10px] font-black rounded-lg uppercase">
                            {getCardioTypeTranslation(log.cardioType)}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(log.loggedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text mt-2 font-bold flex-wrap">
                          <span>{t('minutesCountLabel').replace('{count}', log.durationMin)}</span>
                          {log.distanceKm && <span>{log.distanceKm} km</span>}
                          {log.calories && <span>{log.calories} kcal</span>}
                          {log.heartRate && (
                            <span className="flex items-center gap-0.5 text-danger">
                              <Heart className="w-3.5 h-3.5 fill-danger text-transparent" />
                              <span>{log.heartRate} bpm</span>
                            </span>
                          )}
                        </div>
                        {log.note && <p className="text-xs text-text-muted mt-1 italic">{log.note}</p>}
                      </div>

                      <button
                        onClick={() => handleDeleteCardio(log.id)}
                        className="p-2 hover:bg-danger/10 text-text-muted hover:text-danger rounded-xl border border-transparent hover:border-danger/25 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Log Cardio Form */}
            <div className="order-1 lg:order-2 glass rounded-3xl p-4 sm:p-6 border border-card-border/80">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>{t('cardioAddTitle')}</span>
              </h3>
              <form onSubmit={handleAddCardio} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioTypeLabel')}</label>
                  <select
                    value={cardioType}
                    onChange={(e) => setCardioType(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650 font-semibold"
                  >
                    <option value="WALK">{t('cardioWalk')}</option>
                    <option value="RUN">{t('cardioRun')}</option>
                    <option value="BIKE">{t('cardioBike')}</option>
                    <option value="STAIRMASTER">{t('cardioStairmaster')}</option>
                    <option value="SWIM">{t('cardioSwim')}</option>
                    <option value="OTHER">{t('cardioOther')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('durationLabel')}</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 30"
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioDistanceKmLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.2"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioEstCalories')}</label>
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioAvgHeartRate')}</label>
                    <input
                      type="number"
                      placeholder="e.g. 145"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioDateLabel')}</label>
                  <input
                    type="date"
                    required
                    value={loggedAt}
                    onChange={(e) => setLoggedAt(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-text-muted">{t('cardioNoteLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('cardioNotePlaceholder')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 focus:bg-white border border-card-border rounded-xl text-text text-xs sm:text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                >
                  {t('saveCardioBtn')}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


