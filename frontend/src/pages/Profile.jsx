import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import useTranslation from '../hooks/useTranslation';
import axios from 'axios';
import { User, Lock, Mail, Shield, Check, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Profile() {
  const { user, client, updateProfile } = useAuthStore();
  const { t } = useTranslation();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setProfileError('');

    const res = await updateProfile({ name, email });
    if (res.success) {
      setSuccessMsg(t('profileSaveSuccess'));
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setProfileError(res.error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    try {
      const res = await axios.put(`${API_URL}/auth/password`, {
        currentPassword,
        newPassword
      });
      setPassSuccess(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccess(''), 4000);
    } catch (error) {
      setPassError(error.response?.data?.message || t('passwordSaveError'));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('profileSettingsTitle')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('profileSettingsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="glass rounded-3xl p-6 border border-card-border/80 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>{t('profileCardTitle')}</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{t('profileCardSubtitle')}</p>
          </div>

          {successMsg && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-danger text-xs">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">{t('fullNameLabelProfile')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
            >
              {t('saveProfileBtn')}
            </button>
          </form>
        </div>

        {/* Change Password Settings */}
        <div className="glass rounded-3xl p-6 border border-card-border/80 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <span>{t('changePasswordCardTitle')}</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{t('changePasswordCardSubtitle')}</p>
          </div>

          {passSuccess && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-danger text-xs">
              {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">{t('currentPasswordLabel')}</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">{t('newPasswordLabel')}</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-indigo-600/10"
            >
              {t('updatePasswordBtn')}
            </button>
          </form>
        </div>
      </div>

      {/* Profile summary card */}
      {client && (
        <div className="p-6 glass border border-card-border rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-indigo-600" />
            <span>{t('physicalSpecsTitle')}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-xs text-text-muted">{t('heightLabelProfile')}</span>
              <span className="font-extrabold">{client.height} cm</span>
            </div>
            <div>
              <span className="block text-xs text-text-muted">{t('ageLabelProfile')}</span>
              <span className="font-extrabold">{client.age} {t('yearsUnit')}</span>
            </div>
            <div>
              <span className="block text-xs text-text-muted">{t('initialWeightLabelProfile')}</span>
              <span className="font-extrabold">{client.initialWeight} kg</span>
            </div>
            <div>
              <span className="block text-xs text-text-muted">{t('targetWeightLabelProfile')}</span>
              <span className="font-extrabold text-accent">{client.targetWeight} kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


