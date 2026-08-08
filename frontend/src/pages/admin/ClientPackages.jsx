import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Calendar, CheckCircle, Activity, User, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import useTranslation from '../../hooks/useTranslation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TRAINING_SPLITS = [
  'Push', 'Pull', 'Leg', 'Upper', 'Lower', 'Anterior', 'Posterior', 'Arm', 'Fullbody', 'Cardio', 'Active Rest'
];

export default function ClientPackages() {
  const { language } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Package Modal State
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [newPkgClientId, setNewPkgClientId] = useState('');
  const [newPkgType, setNewPkgType] = useState('Private');
  const [newPkgTotal, setNewPkgTotal] = useState(10);

  // Add Session Modal State
  const [addingSessionForPackage, setAddingSessionForPackage] = useState(null);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainingSplit, setTrainingSplit] = useState('Fullbody');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgRes, clientRes] = await Promise.all([
        axios.get(`${API_URL}/packages`),
        axios.get(`${API_URL}/clients`)
      ]);
      setPackages(pkgRes.data);
      setClients(clientRes.data.clients || []);
    } catch (error) {
      console.error('Error loading data', error);
      alert('Gagal memuat data paket klien');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/packages`, {
        clientId: newPkgClientId,
        packageType: newPkgType,
        totalSessions: newPkgTotal
      });
      setShowNewPackageModal(false);
      setNewPkgClientId('');
      loadData();
    } catch (error) {
      console.error(error);
      alert('Gagal membuat paket baru');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('Hapus paket ini beserta riwayat sesinya secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/packages/${id}`);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus paket');
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/packages/${addingSessionForPackage.id}/sessions`, {
        sessionDate,
        trainingSplit
      });
      setAddingSessionForPackage(null);
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Gagal mencatat sesi');
    }
  };

  const handleDeleteSession = async (packageId, sessionId) => {
    if (!confirm('Hapus sesi ini dari riwayat?')) return;
    try {
      await axios.delete(`${API_URL}/packages/${packageId}/sessions/${sessionId}`);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus sesi');
    }
  };

  const getProgressColor = (used, total) => {
    const ratio = used / total;
    if (ratio >= 1) return 'bg-success';
    if (ratio >= 0.7) return 'bg-warning text-white';
    return 'bg-indigo-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            {language === 'id' ? 'Paket & Sesi Klien' : 'Client Packages'}
          </h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            {language === 'id' ? 'Kelola kuota sesi latihan klien Anda.' : 'Manage your clients training session quotas.'}
          </p>
        </div>
        <button
          onClick={() => setShowNewPackageModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {language === 'id' ? 'Buat Paket Baru' : 'New Package'}
        </button>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {packages.map((pkg) => {
          const sessionsUsed = pkg.sessions.length;
          const isComplete = sessionsUsed >= pkg.totalSessions || !pkg.isActive;
          const progressPercent = Math.min((sessionsUsed / pkg.totalSessions) * 100, 100);

          return (
            <div key={pkg.id} className={`bg-white border rounded-3xl p-5 shadow-xs transition-all ${isComplete ? 'border-success/30 bg-success/5' : 'border-card-border/60 hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isComplete ? 'bg-success/20 text-success' : 'bg-indigo-50 text-indigo-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{pkg.client.user.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold mt-0.5">
                      <span className="px-2 py-0.5 rounded border bg-white border-slate-200 text-slate-600">{pkg.packageType}</span>
                      {isComplete ? (
                        <span className="px-2 py-0.5 rounded border bg-success border-success text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Selesai
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded border bg-indigo-50 border-indigo-100 text-indigo-700">Aktif</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Progress Sesi</span>
                  <span className="text-sm font-black text-slate-800">{sessionsUsed} / {pkg.totalSessions}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(sessionsUsed, pkg.totalSessions)}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              {!isComplete && (
                <button
                  onClick={() => setAddingSessionForPackage(pkg)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Activity className="w-4 h-4" />
                  Catat Sesi Selesai
                </button>
              )}

              {/* Sessions History List */}
              {pkg.sessions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5" /> Riwayat Sesi
                  </h4>
                  <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                    {pkg.sessions.map((session, idx) => (
                      <div key={session.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl text-sm hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                            {pkg.sessions.length - idx}
                          </span>
                          <div>
                            <p className="font-bold text-slate-700">{session.trainingSplit}</p>
                            <p className="text-[10px] font-semibold text-text-muted">
                              {new Date(session.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(pkg.id, session.id)}
                          className="p-1.5 text-slate-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {packages.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">Belum Ada Paket</h3>
            <p className="text-sm text-text-muted">Buat paket baru untuk mulai mencatat sesi klien Anda.</p>
          </div>
        )}
      </div>

      {/* Modal Buat Paket Baru */}
      {showNewPackageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-5">Buat Paket Baru</h3>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Pilih Klien</label>
                <select
                  required
                  value={newPkgClientId}
                  onChange={(e) => setNewPkgClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Tipe Paket</label>
                  <select
                    value={newPkgType}
                    onChange={(e) => setNewPkgType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Private">Private</option>
                    <option value="Grup">Grup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Total Sesi</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPkgTotal}
                    onChange={(e) => setNewPkgTotal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPackageModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-colors"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Sesi */}
      {addingSessionForPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-1">Catat Sesi</h3>
            <p className="text-xs font-medium text-slate-500 mb-5">
              Untuk klien <span className="font-bold text-slate-700">{addingSessionForPackage.client.user.name}</span>
            </p>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Tanggal Sesi
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Jadwal Latihan (Split)
                </label>
                <select
                  required
                  value={trainingSplit}
                  onChange={(e) => setTrainingSplit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {TRAINING_SPLITS.map(split => (
                    <option key={split} value={split}>{split}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddingSessionForPackage(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Tandai Selesai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
