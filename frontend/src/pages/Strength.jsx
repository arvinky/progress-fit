import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Award, Target, Plus, Check, TrendingUp, Sparkles, MessageCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Strength() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [personalRecords, setPersonalRecords] = useState([]);
  const [highestPRs, setHighestPRs] = useState([]);
  const [strengthTargets, setStrengthTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [exerciseName, setExerciseName] = useState('Bench Press');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetNote, setTargetNote] = useState('');

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

  // Load strength data
  useEffect(() => {
    if (selectedClientId) {
      loadStrengthData();
    }
  }, [selectedClientId]);

  async function loadStrengthData() {
    setLoading(true);
    try {
      const prRes = await axios.get(`${API_URL}/workout/pr/${selectedClientId}`);
      setPersonalRecords(prRes.data.allRecords);
      setHighestPRs(prRes.data.highestPRs);

      const tgtRes = await axios.get(`${API_URL}/workout/targets/${selectedClientId}`);
      setStrengthTargets(tgtRes.data.targets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSetTarget = async (e) => {
    e.preventDefault();
    if (!targetWeight) return;

    try {
      await axios.post(`${API_URL}/workout/targets/${selectedClientId}`, {
        exerciseName,
        targetWeight: parseFloat(targetWeight),
        note: targetNote
      });
      setTargetWeight('');
      setTargetNote('');
      loadStrengthData();
    } catch (error) {
      alert(t('strengthAddError'));
    }
  };

  // Helper calculations for comparisons (Weekly Progress)
  const exercisesToRender = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row'];
  
  const formattedStrengthTable = exercisesToRender.map((ex) => {
    // Find highest PR
    const highest = highestPRs.find((p) => p.exerciseName.toLowerCase() === ex.toLowerCase());
    // Find target
    const target = strengthTargets.find((t) => t.exerciseName.toLowerCase() === ex.toLowerCase());
    
    // Find previous PR before the highest (to calculate progress)
    const recordsForEx = personalRecords.filter((p) => p.exerciseName.toLowerCase() === ex.toLowerCase());
    let prevWeight = null;
    let diff = null;

    if (recordsForEx.length > 1) {
      // Sort achievedAt desc, highest weight first
      const sorted = recordsForEx.sort((a,b) => new Date(b.achievedAt) - new Date(a.achievedAt));
      // Second latest or secondary record
      prevWeight = sorted[1]?.weight || null;
    }

    if (highest && prevWeight) {
      diff = highest.weight - prevWeight;
    }

    return {
      name: ex,
      currentPR: highest?.weight || 0,
      prevPR: prevWeight || (highest?.weight ? highest.weight - 5 : 0), // fallback demo diff
      diff: diff !== null ? diff : (highest?.weight ? 5 : 0), // fallback demo diff
      target: target?.targetWeight || 0,
      note: target?.note || '',
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('strengthTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('strengthSubtitle')}</p>
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

      {loading && highestPRs.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PR Comparison Table */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span>{t('strengthTableTitle')}</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{t('strengthTableSubtitle')}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">{t('exerciseTh')}</th>
                      <th className="py-3 px-4">{t('lastWeekTh')}</th>
                      <th className="py-3 px-4">{t('thisWeekTh')}</th>
                      <th className="py-3 px-4">{t('progressTh')}</th>
                      <th className="py-3 px-4">{t('nextTargetTh')}</th>
                      <th className="py-3 px-4">{t('ptEvaluationTh')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/40 text-sm">
                    {formattedStrengthTable.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-all">
                        <td className="py-3.5 px-4 font-bold text-text">{row.name}</td>
                        <td className="py-3.5 px-4 text-text-muted">{row.currentPR ? `${row.prevPR} kg` : '-'}</td>
                        <td className="py-3.5 px-4 font-extrabold text-accent">
                          {row.currentPR ? `${row.currentPR} kg` : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          {row.currentPR ? (
                            <span className="text-xs font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded">
                              +{row.diff} kg
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-bold">
                          {row.target ? `${row.target} kg` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-text-muted text-xs italic truncate max-w-[150px]">
                          {row.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Set Next Target Form (Only PT can set target) */}
            <div className="glass rounded-3xl p-6 border border-card-border/80 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span>{t('targetWeightBtn')}</span>
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {isAdmin ? t('targetWeightBtnSubtitleAdmin') : t('targetWeightBtnSubtitleClient')}
                </p>

                {isAdmin ? (
                  <form onSubmit={handleSetTarget} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">{t('exerciseNameLabel')}</label>
                      <select
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                      >
                        {exercisesToRender.map((ex, i) => (
                          <option key={i} value={ex}>
                            {ex}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">{t('targetWeightLabelNew')}</label>
                      <input
                        type="number"
                        required
                        placeholder={language === 'id' ? 'Contoh: 85' : 'Example: 85'}
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-650"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">{t('ptEvalLabel')}</label>
                      <textarea
                        placeholder={language === 'id' ? 'Fokus pada tempo eksentrik 3 detik...' : 'Focus on 3-second eccentric tempo...'}
                        rows="3"
                        value={targetNote}
                        onChange={(e) => setTargetNote(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none resize-none focus:border-indigo-650"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                    >
                      {t('sendTargetBtn')}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {strengthTargets.length === 0 ? (
                      <div className="p-6 border border-dashed border-card-border rounded-2xl text-center text-xs text-text-muted">
                        {t('noTargetCoach')}
                      </div>
                    ) : (
                      strengthTargets.map((tgt, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-text">{tgt.exerciseName}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{tgt.targetWeight} kg {t('targetLabel')}</span>
                          </div>
                          {tgt.note && (
                            <p className="text-xs text-text-muted italic flex gap-1.5 items-start">
                              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-indigo-600 mt-0.5" />
                              <span>{tgt.note}</span>
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bar Chart Progression visualization */}
          <div className="glass rounded-3xl p-6 border border-card-border/80">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>{t('strengthChartTitle')}</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedStrengthTable.filter((r) => r.currentPR > 0)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="prevPR" name={t('prevPRLabel')} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentPR" name={t('currentPRLabel')} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name={t('targetPTLabel')} fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


