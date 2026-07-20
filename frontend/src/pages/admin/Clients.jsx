import React, { useState, useEffect } from 'react';
import useTranslation from '../../hooks/useTranslation';
import axios from 'axios';
import {
  Search,
  UserPlus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('true'); // active only by default

  // Modal forms state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // New Client Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [initialWeight, setInitialWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [program, setProgram] = useState('CUTTING');

  useEffect(() => {
    fetchClients();
  }, [search, programFilter, statusFilter]);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clients`, {
        params: {
          search,
          program: programFilter || undefined,
          isActive: statusFilter === '' ? undefined : statusFilter
        }
      });
      setClients(res.data.clients);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clients`, {
        name,
        email,
        password,
        age: parseInt(age),
        height: parseFloat(height),
        initialWeight: parseFloat(initialWeight),
        targetWeight: parseFloat(targetWeight),
        program
      });
      setIsAddOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan client');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/clients/${selectedClient.id}`, {
        name,
        email,
        age: parseInt(age),
        height: parseFloat(height),
        initialWeight: parseFloat(initialWeight),
        targetWeight: parseFloat(targetWeight),
        program
      });
      setIsEditOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengupdate client');
    }
  };

  const toggleActive = async (id) => {
    try {
      await axios.patch(`${API_URL}/clients/${id}/toggle-active`);
      fetchClients();
    } catch (error) {
      alert('Gagal mengubah status keaktifan client');
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setName(client.name);
    setEmail(client.email);
    setAge(client.age);
    setHeight(client.height);
    setInitialWeight(client.initialWeight);
    setTargetWeight(client.targetWeight);
    setProgram(client.program);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAge(25);
    setHeight(170);
    setInitialWeight(70);
    setTargetWeight(65);
    setProgram('CUTTING');
    setSelectedClient(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">{t('clientsTitle')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('clientsSubtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addClientBtn')}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass rounded-2xl border border-card-border/60">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>
        <div>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
          >
            <option value="">{t('allPrograms')}</option>
            <option value="BULKING">Bulking</option>
            <option value="CUTTING">Cutting</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="glass rounded-3xl overflow-hidden border border-card-border/80">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            Tidak ada client yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700">{t('nameEmailTh')}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700">{t('ageHeightTh')}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700">{t('weightTh')}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700">{t('programTh')}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700">{t('statusTh')}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700 text-right">{t('actionTh')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-sm text-text">{c.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{c.email}</div>
                    </td>
                    <td className="p-4 text-sm text-text">
                      <div>{c.age} Tahun</div>
                      <div className="text-xs text-text-muted mt-0.5">{c.height} cm</div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-semibold text-text">
                        {c.initialWeight} kg → <span className="text-accent">{c.currentWeight} kg</span>
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">Target: {c.targetWeight} kg</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${
                          c.program === 'BULKING'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                            : c.program === 'CUTTING'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        }`}
                      >
                        {c.program}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(c.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold ${
                          c.isActive ? 'text-accent' : 'text-danger'
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-accent" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-danger" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-xl rounded-3xl border border-card-border p-4 sm:p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto mx-0">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-text">{t('addNewClientTitle')}</h3>
              <p className="text-xs text-text-muted">{t('addNewClientSubtitle')}</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">{t('defaultPasswordLabel')}</label>
                <input
                  type="password"
                  placeholder="progressfit123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Umur (Tahun)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('heightLabel')}</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  >
                    <option value="BULKING">Bulking</option>
                    <option value="CUTTING">Cutting</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('initialWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('targetWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20"
                >
                  {t('saveClientBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-xl rounded-3xl border border-card-border p-4 sm:p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto mx-0">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-text">{t('editClientTitle')}</h3>
              <p className="text-xs text-text-muted">{t('editClientSubtitle')}</p>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('ageLabel')}</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('heightLabel')}</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  >
                    <option value="BULKING">Bulking</option>
                    <option value="CUTTING">Cutting</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('initialWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">{t('targetWeightLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-card-border rounded-xl text-text text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20"
                >
                  {t('saveChangesBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


