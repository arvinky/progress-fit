import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { History, Plus, Trash2, Calendar, Clock, Dumbbell, ShieldAlert, Sparkles, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function WorkoutHistory() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [sessionName, setSessionName] = useState('Push Day');
  const [durationMin, setDurationMin] = useState(60);
  const [note, setNote] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().split('T')[0] + 'T10:00');

  // Exercise Inputs list
  const [exercises, setExercises] = useState([
    { exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 60, rpe: 8, note: '' }
  ]);

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

  // Load workout sessions
  useEffect(() => {
    if (selectedClientId) {
      loadSessions();
    }
  }, [selectedClientId]);

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/workout/sessions/${selectedClientId}`);
      setSessions(res.data.sessions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { exerciseName: '', sets: 3, reps: 10, weight: 20, rpe: 8, note: '' }]);
  };

  const handleRemoveExerciseRow = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx, field, value) => {
    const updated = [...exercises];
    updated[idx][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (exercises.length === 0) return alert(t('workoutAddEmptyError'));

    try {
      await axios.post(`${API_URL}/workout/sessions/${selectedClientId}`, {
        sessionName,
        durationMin: parseInt(durationMin),
        note,
        startTime: new Date(startTime),
        exercises
      });
      setIsOpen(false);
      // Reset Form
      setSessionName('Push Day');
      setDurationMin(60);
      setNote('');
      setExercises([{ exerciseName: 'Bench Press', sets: 3, reps: 10, weight: 60, rpe: 8, note: '' }]);
      loadSessions();
    } catch (error) {
      alert(t('workoutAddError'));
    }
  };

  const handleDeleteSession = async (sId) => {
    if (!confirm(t('workoutDeleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/workout/sessions/${sId}`);
      loadSessions();
    } catch (error) {
      alert(t('workoutDeleteError'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('workoutHistoryTitleMain')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('workoutHistorySubtitleMain')}</p>
        </div>

        {/* Action Controls */}
        <div className="flex w-full sm:w-auto items-center gap-3">
          {isAdmin && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-4 py-3 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-primary font-bold shadow-sm"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('logWorkoutBtn')}</span>
          </button>
        </div>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="h-60 flex flex-col justify-center items-center text-center p-6 border border-dashed border-card-border rounded-2xl">
          <History className="w-12 h-12 text-text-muted mb-3 opacity-40" />
          <p className="text-sm font-semibold text-text-muted">{t('workoutEmptyState')}</p>
        </div>
      ) : (
        /* Sessions History Feed */
        <div className="space-y-6">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="glass border border-card-border/80 rounded-3xl p-6 relative overflow-hidden transition-all hover:shadow-sm"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-card-border/60">
                <div>
                  <h3 className="text-lg font-extrabold text-text flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-slate-800" />
                    <span>{sess.sessionName || (language === 'id' ? 'Latihan Beban' : 'Weightlifting')}</span>
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {new Date(sess.startTime).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>{sess.durationMin || '0'} {language === 'id' ? 'Menit' : 'Minutes'}</span>
                    </span>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-text-muted">{t('sets')}</span>
                    <span className="text-sm font-extrabold text-text">{sess.totalSets}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-text-muted">{t('volume')}</span>
                    <span className="text-sm font-extrabold text-accent">{sess.totalVolume} kg</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(sess.id)}
                    className="p-2 bg-slate-100 hover:bg-danger/10 hover:text-danger border border-slate-200 hover:border-danger/30 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exercises List inside the Session */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4">{t('exerciseTh')}</th>
                      <th className="py-2.5 px-4">{t('sets')}</th>
                      <th className="py-2.5 px-4">{t('reps')}</th>
                      <th className="py-2.5 px-4">{t('weight')}</th>
                      <th className="py-2.5 px-4">RPE</th>
                      <th className="py-2.5 px-4 text-right">{t('volume')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/30 text-sm">
                    {sess.exercises.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50 transition-all">
                        <td className="py-3 px-4 font-bold text-text">{ex.exerciseName}</td>
                        <td className="py-3 px-4">{ex.sets} {t('sets')}</td>
                        <td className="py-3 px-4">{ex.reps} {t('reps')}</td>
                        <td className="py-3 px-4 text-accent font-semibold">{ex.weight} kg</td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-xs rounded font-medium text-slate-700">
                            RPE {ex.rpe || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-text-muted font-medium">
                          {ex.sets * ex.reps * ex.weight} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Session Note */}
              {sess.note && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-text-muted italic">
                  {t('globalNoteText')} {sess.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Workout Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-3xl rounded-3xl border border-card-border p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-text">{t('newWorkoutSessionTitle')}</h3>
              <p className="text-xs text-text-muted">{t('newWorkoutSessionSubtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('sessionNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('dateTimeLabel')}</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('durationLabel')}</label>
                  <input
                    type="number"
                    required
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                  />
                </div>
              </div>

              {/* Dynamic Exercises Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('exerciseListLabel')}</span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold rounded-lg transition-all text-slate-800"
                  >
                    {t('addExerciseRowBtn')}
                  </button>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {exercises.map((ex, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder={t('movementPlaceholder')}
                            value={ex.exerciseName}
                            onChange={(e) => handleExerciseChange(idx, 'exerciseName', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-xs focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            required
                            placeholder={t('setPlaceholder')}
                            value={ex.sets}
                            onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-xs focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            required
                            placeholder={t('repPlaceholder')}
                            value={ex.reps}
                            onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-xs focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder={t('weightPlaceholder')}
                            value={ex.weight}
                            onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-xs focus:outline-none pr-6 focus:border-indigo-650"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">kg</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder={language === 'id' ? 'Catatan gerakan (Opsional)...' : 'Exercise notes (Optional)...'}
                            value={ex.note}
                            onChange={(e) => handleExerciseChange(idx, 'note', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-[11px] focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="RPE (1-10)"
                            min="1"
                            max="10"
                            value={ex.rpe}
                            onChange={(e) => handleExerciseChange(idx, 'rpe', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-card-border rounded-lg text-text text-xs focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        {exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseRow(idx)}
                            className="px-2.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg border border-danger/20 text-xs font-semibold"
                          >
                            {t('delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">{t('globalNoteLabel')}</label>
                <textarea
                  placeholder={t('globalNotePlaceholder')}
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none resize-none focus:border-indigo-650"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/10"
                >
                  {t('saveWorkoutBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


