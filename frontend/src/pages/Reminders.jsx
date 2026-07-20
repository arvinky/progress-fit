import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import { Bell, Plus, Trash2, MailOpen, Mail, SmilePlus, Send, X, Reply } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const QUICK_EMOJIS = ['👍', '💪', '✅', '🔥', '🙏', '😅', '💯', '🏃', '🫡', '❤️'];

export default function Reminders() {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State - Add Reminder (PT only)
  const [receiverId, setReceiverId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Reply state - per reminder id
  const [replyingTo, setReplyingTo] = useState(null); // reminder id
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadReminders();
    if (isAdmin) {
      axios.get(`${API_URL}/clients?isActive=true`).then((res) => {
        setClients(res.data.clients);
        if (res.data.clients.length > 0) {
          setReceiverId(res.data.clients[0].userId);
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

  const handleQuickEmoji = async (rId, emoji) => {
    setSendingReply(true);
    try {
      await axios.patch(`${API_URL}/reminders/${rId}/reply`, { reply: emoji });
      loadReminders();
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error(error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendReply = async (rId) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await axios.patch(`${API_URL}/reminders/${rId}/reply`, { reply: replyText });
      loadReminders();
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error(error);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          {isAdmin ? t('remindersTitleAdmin') : t('remindersTitleClient')}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {isAdmin ? t('remindersSubtitleAdmin') : t('remindersSubtitleClient')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reminders Feed */}
        <div className="order-2 lg:order-1 lg:col-span-2 glass rounded-3xl p-6 border border-card-border/80 space-y-4">
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
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-4 sm:p-5 border rounded-2xl flex flex-col gap-3 transition-all relative overflow-hidden ${
                    rem.status === 'UNREAD' && !isAdmin
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Top row: title + read badge + delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-text">{rem.title}</span>
                        {rem.status === 'UNREAD' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                            <Mail className="w-3 h-3" />
                            <span>{t('unreadLabel')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                            <MailOpen className="w-3 h-3" />
                            <span>{t('readLabel')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{rem.message}</p>
                      <span className="block text-[10px] text-text-muted/80 pt-0.5">
                        {t('sentBy')
                          .replace('{sender}', rem.sender?.name || 'Coach Arvin')
                          .replace(
                            '{date}',
                            new Date(rem.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          )}
                      </span>
                    </div>

                    {/* Admin delete */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(rem.id)}
                        className="p-1.5 hover:bg-danger/10 text-text-muted hover:text-danger border border-transparent hover:border-danger/20 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Client reply shown - if already replied */}
                  {rem.clientReply && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                      <Reply className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 block">{t('yourReplyLabel')}</span>
                        <p className="text-sm font-semibold text-text break-words">{rem.clientReply}</p>
                      </div>
                      {/* Allow editing reply */}
                      {!isAdmin && (
                        <button
                          onClick={() => { setReplyingTo(rem.id); setReplyText(''); }}
                          className="text-[10px] text-text-muted hover:text-indigo-600 font-bold flex-shrink-0 transition-all"
                        >
                          Ubah
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin: show client reply if any */}
                  {isAdmin && rem.clientReply && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                      <Reply className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-emerald-600 block">Balasan {rem.receiver?.name}:</span>
                        <p className="text-sm font-semibold text-text break-words">{rem.clientReply}</p>
                      </div>
                    </div>
                  )}

                  {/* Client action bar: mark read + reply */}
                  {!isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                      {rem.status === 'UNREAD' && (
                        <button
                          onClick={() => handleMarkAsRead(rem.id)}
                          className="px-2.5 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white font-bold rounded-lg border border-accent/20 transition-all text-[10px]"
                        >
                          {t('markReadBtn')}
                        </button>
                      )}
                      {replyingTo !== rem.id && (
                        <button
                          onClick={() => { setReplyingTo(rem.id); setReplyText(''); }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg border border-indigo-100 transition-all text-[10px]"
                        >
                          <SmilePlus className="w-3 h-3" />
                          <span>Balas</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reply Panel - expanded inline */}
                  {!isAdmin && replyingTo === rem.id && (
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      {/* Quick emoji row */}
                      <div>
                        <p className="text-[10px] font-bold text-text-muted mb-2">{t('emojiReactionTitle')}</p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleQuickEmoji(rem.id, emoji)}
                              disabled={sendingReply}
                              className="text-xl hover:scale-125 transition-transform disabled:opacity-50"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text reply */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={t('replyPlaceholder')}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply(rem.id)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-text focus:outline-none focus:border-indigo-400"
                        />
                        <button
                          onClick={() => handleSendReply(rem.id)}
                          disabled={sendingReply || !replyText.trim()}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-all"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Reminder Card (PT/Admin Only) or System Notice */}
        <div className="order-1 lg:order-2 glass rounded-3xl p-6 border border-card-border/80">
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
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-black text-indigo-600">A</div>
                <div>
                  <p className="text-sm font-extrabold text-text">Coach Arvin</p>
                  <p className="text-[10px] text-text-muted">Personal Trainer</p>
                </div>
              </div>
              <h3 className="text-base font-bold text-text">{t('systemNoticeTitle')}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('systemNoticeDesc')}
              </p>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-text-muted mb-2">Cara Membalas:</p>
                <ul className="text-xs text-text-muted space-y-1.5">
                  <li className="flex items-start gap-2"><span>👆</span> Buka notifikasi lalu klik tombol <strong>Balas</strong></li>
                  <li className="flex items-start gap-2"><span>😊</span> Pilih emoji cepat untuk reaksi singkat</li>
                  <li className="flex items-start gap-2"><span>✍️</span> Atau ketik pesan balasan langsung</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
