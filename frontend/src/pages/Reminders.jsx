import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Bell, Plus, Check, MessageSquare, Trash2, Calendar, MailOpen, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Reminders() {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State - Add Reminder (PT only)
  const [receiverId, setReceiverId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReminders();
    if (isAdmin) {
      axios.get(`${API_URL}/clients?isActive=true`).then((res) => {
        setClients(res.data.clients);
        if (res.data.clients.length > 0) {
          setReceiverId(res.data.clients[0].userId); // receiver is User.id
        }
      });
    }
  }, [isAdmin]);

  async function loadReminders() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reminders`);
      setReminders(res.data.reminders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!receiverId || !title || !message) return;

    try {
      await axios.post(`${API_URL}/reminders`, {
        receiverId: parseInt(receiverId),
        title,
        message
      });
      setTitle('');
      setMessage('');
      loadReminders();
      alert(t('reminderSendSuccess'));
    } catch (error) {
      alert(t('reminderSendError'));
    }
  };

  const handleMarkAsRead = async (rId) => {
    try {
      await axios.patch(`${API_URL}/reminders/${rId}/read`);
      loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (rId) => {
    if (!confirm(t('reminderDeleteConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/reminders/${rId}`);
      loadReminders();
    } catch (error) {
      alert(t('reminderDeleteError'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight">
          {isAdmin ? t('remindersTitleAdmin') : t('remindersTitleClient')}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {isAdmin ? t('remindersSubtitleAdmin') : t('remindersSubtitleClient')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reminders Feed */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80 space-y-4">
          <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-indigo-600 animate-bounce" />
            <span>{t('messagesBoxTitle')}</span>
          </h3>

          {loading && reminders.length === 0 ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm italic">
              {t('noActiveNotifications')}
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-5 border rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden ${
                    rem.status === 'UNREAD' && !isAdmin
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-text">{rem.title}</span>
                        {rem.status === 'UNREAD' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <Mail className="w-3 h-3" />
                            <span>{t('unreadLabel')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            <MailOpen className="w-3 h-3" />
                            <span>{t('readLabel')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{rem.message}</p>
                      <span className="block text-[10px] text-text-muted/80 pt-1.5">
                        {t('sentBy')
                          .replace('{sender}', rem.sender.name)
                          .replace(
                            '{date}',
                            new Date(rem.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          )}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isAdmin && rem.status === 'UNREAD' && (
                        <button
                          onClick={() => handleMarkAsRead(rem.id)}
                          className="px-2.5 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white font-bold rounded-lg border border-accent/20 transition-all text-[10px]"
                        >
                          {t('markReadBtn')}
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(rem.id)}
                          className="p-1.5 hover:bg-danger/10 text-text-muted hover:text-danger border border-transparent hover:border-danger/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Reminder Card (PT/Admin Only) */}
        <div className="glass rounded-3xl p-6 border border-card-border/80">
          {isAdmin ? (
            <>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>{t('newReminderTitle')}</span>
              </h3>
              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('receiverClientLabel')}</label>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.userId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('reminderTitleInput')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('reminderTitlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('reminderMessageInput')}</label>
                  <textarea
                    required
                    placeholder={t('reminderMsgPlaceholder')}
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none resize-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
                >
                  {t('sendReminderBtn')}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-text">{t('systemNoticeTitle')}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('systemNoticeDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
