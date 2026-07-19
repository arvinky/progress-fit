import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Calendar, Copy, Plus, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Schedules() {
  const { user, client: authClient } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State - Add Schedule
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [programName, setProgramName] = useState('Push Day');
  const [description, setDescription] = useState('');

  // Copy Split State
  const [copyToClientId, setCopyToClientId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Load clients if Admin
  useEffect(() => {
    if (isAdmin) {
      axios.get(`${API_URL}/clients?isActive=true`).then((res) => {
        setClients(res.data.clients);
        if (res.data.clients.length > 0) {
          setSelectedClientId(res.data.clients[0].id);
          setCopyToClientId(res.data.clients.length > 1 ? res.data.clients[1].id : '');
        }
      });
    } else if (authClient) {
      setSelectedClientId(authClient.id);
    }
  }, [isAdmin, authClient]);

  // Load schedules
  useEffect(() => {
    if (selectedClientId) {
      loadSchedules();
    }
  }, [selectedClientId]);

  async function loadSchedules() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/workout/schedules/${selectedClientId}`);
      setSchedules(res.data.schedules);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!programName) return;

    try {
      await axios.post(`${API_URL}/workout/schedules/${selectedClientId}`, {
        dayOfWeek,
        programName,
        description
      });
      setProgramName('Push Day');
      setDescription('');
      loadSchedules();
    } catch (error) {
      alert(t('scheduleAddError'));
    }
  };

  const handleDeleteSchedule = async (sId) => {
    if (!confirm(t('scheduleDeleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/workout/schedules/${sId}`);
      loadSchedules();
    } catch (error) {
      alert(t('scheduleDeleteError'));
    }
  };

  const handleCopySchedule = async (e) => {
    e.preventDefault();
    if (!copyToClientId) return alert(t('scheduleSelectTargetError'));
    try {
      await axios.post(`${API_URL}/workout/schedules/copy`, {
        fromClientId: selectedClientId,
        toClientId: copyToClientId
      });
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      alert(t('scheduleCopyError'));
    }
  };

  // Helper arrays
  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  const dayNamesIndo = {
    MONDAY: 'Senin',
    TUESDAY: 'Selasa',
    WEDNESDAY: 'Rabu',
    THURSDAY: 'Kamis',
    FRIDAY: 'Jumat',
    SATURDAY: 'Sabtu',
    SUNDAY: 'Minggu'
  };

  const dayNamesEng = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
  };

  const dayLabels = language === 'id' ? dayNamesIndo : dayNamesEng;

  // Sort schedules by week day order
  const sortedSchedules = daysOrder.map((day) => {
    const found = schedules.find((s) => s.dayOfWeek === day);
    return {
      dayOfWeek: day,
      dayName: dayLabels[day],
      schedule: found || null
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">{t('scheduleSplitTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('scheduleSplitSubtitle')}</p>
        </div>

        {/* Action Controls */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly split cards view */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>{t('scheduleDetailsTitle')}</span>
          </h3>

          {loading && schedules.length === 0 ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedSchedules.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 glass border border-card-border/80 rounded-2xl flex flex-col justify-between hover-scale relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg uppercase">
                        {item.dayName}
                      </span>
                      {isAdmin && item.schedule && (
                        <button
                          onClick={() => handleDeleteSchedule(item.schedule.id)}
                          className="text-text-muted hover:text-danger p-1 rounded hover:bg-danger/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {item.schedule ? (
                      <>
                        <h4 className="font-extrabold text-base text-text">{item.schedule.programName}</h4>
                        <p className="text-xs text-text-muted leading-relaxed">{item.schedule.description || t('noExtraDetails')}</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-sm text-text-muted italic">{t('restDayLabel')}</h4>
                        <p className="text-[11px] text-text-muted">{t('restDayDesc')}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PT Custom Split Designer & Copier */}
        <div className="space-y-6">
          {isAdmin ? (
            <>
              {/* Designer */}
              <div className="glass rounded-3xl p-6 border border-card-border/80">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent" />
                  <span>{t('designerTitle')}</span>
                </h3>
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('dayOfWeekLabel')}</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    >
                      <option value="MONDAY">{dayLabels.MONDAY}</option>
                      <option value="TUESDAY">{dayLabels.TUESDAY}</option>
                      <option value="WEDNESDAY">{dayLabels.WEDNESDAY}</option>
                      <option value="THURSDAY">{dayLabels.THURSDAY}</option>
                      <option value="FRIDAY">{dayLabels.FRIDAY}</option>
                      <option value="SATURDAY">{dayLabels.SATURDAY}</option>
                      <option value="SUNDAY">{dayLabels.SUNDAY}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('programNameLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Push Day, Pull, Lower Body, Rest"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('routineDescriptionLabel')}</label>
                    <textarea
                      placeholder={language === 'id' ? 'Fokus pada Bench Press, Incline Dumbbell, Chest Fly, Lateral Raise...' : 'Focus on Bench Press, Incline Dumbbell, Chest Fly, Lateral Raise...'}
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none resize-none focus:border-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                  >
                    {t('saveSplitBtn')}
                  </button>
                </form>
              </div>

              {/* Copy Split */}
              <div className="glass rounded-3xl p-6 border border-card-border/80">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-accent" />
                  <span>{t('copySplitTitle')}</span>
                </h3>
                <p className="text-xs text-text-muted mb-4">{t('copySplitSubtitle')}</p>

                <form onSubmit={handleCopySchedule} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">{t('destinationClientLabel')}</label>
                    <select
                      value={copyToClientId}
                      onChange={(e) => setCopyToClientId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                    >
                      <option value="">{t('selectClientDest')}</option>
                      {clients
                        .filter((c) => c.id !== parseInt(selectedClientId))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-accent" />
                        <span className="text-accent">{t('copySuccessLabel')}</span>
                      </>
                    ) : (
                      <span>{t('copySplitBtn')}</span>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Client view notes */
            <div className="glass rounded-3xl p-6 border border-card-border/80 space-y-4">
              <h3 className="text-base font-bold text-text">{t('coachSplitAdviceTitle')}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('coachSplitAdviceDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
