import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  Plus, 
  Trash2, 
  Copy,
  Upload,
  Edit3,
  Users,
  BarChart3,
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  ChevronRight,
  FileText,
  Calendar,
  Check,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
  getQuestionnaireByCode,
  getRespondents,
  addRespondent,
  updateRespondent,
  bulkUpdateRespondents,
  deleteRespondent, 
  rotateToken, 
  importRespondents 
} from '../../api';

export default function RespondentManager() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newToken, setNewToken] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // User is always authenticated (ProtectedRoute)
  const hasSession = true;

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    try {
      const qResponse = await getQuestionnaireByCode(code);
      setQuestionnaire(qResponse.data);
      
      // Always use editor API with tokens (user is authenticated)
      if (qResponse.data?.id) {
        const rResponse = await getRespondents(qResponse.data.id);
        setRespondents(rResponse.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRespondent = async (data) => {
    if (!questionnaire?.id) return;
    try {
      const response = await addRespondent(questionnaire.id, data);
      setRespondents([response.data, ...respondents]);
      setNewToken({ name: response.data.name, token: response.data.token });
      setShowAddModal(false);
      success('Respondent přidán');
    } catch (err) {
      error(err.response?.data?.error || 'Přidání selhalo');
    }
  };

  const handleEditRespondent = async (id, data) => {
    try {
      await updateRespondent(id, data);
      setRespondents(respondents.map(r => r.id === id ? { ...r, ...data } : r));
      setShowEditModal(null);
      success('Respondent upraven');
    } catch (err) {
      error(err.response?.data?.error || 'Úprava selhala');
    }
  };

  const handleBulkUpdate = async (data) => {
    if (!questionnaire?.id || selectedIds.size === 0) return;
    try {
      await bulkUpdateRespondents(questionnaire.id, {
        respondentIds: Array.from(selectedIds),
        ...data
      });
      loadData();
      setSelectedIds(new Set());
      setShowBulkModal(false);
      success(`Aktualizováno ${selectedIds.size} respondentů`);
    } catch (err) {
      error(err.response?.data?.error || 'Hromadná aktualizace selhala');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Opravdu chcete smazat tohoto respondenta a všechna jeho data?')) return;
    
    try {
      await deleteRespondent(id);
      setRespondents(respondents.filter(r => r.id !== id));
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
      success('Respondent smazán');
    } catch (err) {
      error('Mazání selhalo');
    }
  };

  const handleRotateToken = async (id) => {
    try {
      const response = await rotateToken(id);
      const respondent = respondents.find(r => r.id === id);
      setNewToken({ name: respondent?.name, token: response.data.token });
      loadData(); // Reload to get updated token
      success('Odkaz vygenerován - zkopírujte ho');
    } catch (err) {
      error('Generování odkazu selhalo');
    }
  };

  const handleImport = async (data) => {
    if (!questionnaire?.id) return;
    try {
      const response = await importRespondents(questionnaire.id, data);
      loadData();
      setShowImportModal(false);
      success(`Importováno ${response.data.imported.length} respondentů`);
      
      const csv = response.data.imported.map(r => `${r.name},${window.location.origin}/r/${r.token}`).join('\n');
      const blob = new Blob([`Jméno,Odkaz\n${csv}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'respondenti-odkazy.csv';
      a.click();
    } catch (err) {
      error('Import selhal');
    }
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${token}`);
    success('Odkaz zkopírován');
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRespondents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRespondents.map(r => r.id)));
    }
  };

  const filteredRespondents = respondents.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.ico?.includes(search) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getValidityStatus = (r) => {
    const now = new Date();
    if (r.valid_from && new Date(r.valid_from) > now) return 'not_yet';
    if (r.valid_until && new Date(r.valid_until) < now) return 'expired';
    return 'valid';
  };

  // Compute display status based on DB status and first_accessed_at
  const getDisplayStatus = (r) => {
    if (r.status === 'submitted') return 'submitted';
    if (r.status === 'locked') return 'locked';
    if (r.status === 'in_progress') return 'in_progress';
    // For 'invited' status, check if they opened the form
    if (r.first_accessed_at) return 'viewed';
    return 'not_opened';
  };

  const statusBadge = {
    not_opened: { label: t('respondents.statuses.notOpened'), class: 'badge-default', icon: Clock },
    viewed: { label: t('respondents.statuses.viewed'), class: 'badge-info', icon: Eye },
    in_progress: { label: t('respondents.statuses.inProgress'), class: 'badge-warning', icon: Edit3 },
    submitted: { label: t('respondents.statuses.submitted'), class: 'badge-success', icon: CheckCircle },
    locked: { label: t('respondents.statuses.locked'), class: 'badge-error', icon: AlertCircle }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Dotazník nenalezen</h2>
            <Link to="/" className="btn btn-primary mt-4">
              Zpět na seznam
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                title="Zpět na seznam dotazníků"
              >
                <Home size={18} />
                <span className="text-sm font-medium hidden sm:inline">Seznam</span>
              </Link>
              <ChevronRight size={16} className="text-gray-300" />
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                <p className="text-sm text-gray-500">{t('respondents.title')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Link to={`/e/${code}`} className="nav-tab">
              <BarChart3 size={16} className="inline mr-1" />
              {t('editor.overview')}
            </Link>
            <Link to={`/e/${code}/builder`} className="nav-tab">
              <Edit3 size={16} className="inline mr-1" />
              {t('editor.builder')}
            </Link>
            <Link to={`/e/${code}/respondents`} className="nav-tab active">
              <Users size={16} className="inline mr-1" />
              {t('editor.respondentsTab')}
            </Link>
            <Link to={`/e/${code}/responses`} className="nav-tab">
              <FileText size={16} className="inline mr-1" />
              {t('editor.responsesTab')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
            {selectedIds.size > 0 && hasSession && (
              <button 
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary"
              >
                <Calendar size={18} />
                {t('respondents.bulkActions')} ({selectedIds.size})
              </button>
            )}
          </div>
          {hasSession && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowImportModal(true)}
                className="btn btn-secondary"
              >
                <Upload size={18} />
                {t('common.import')}
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus size={18} />
                {t('respondents.addRespondent')}
              </button>
            </div>
          )}
        </div>

        {/* New Token Alert */}
        {newToken && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-green-800">{t('respondents.copyLink')}: {newToken.name}</h3>
                <p className="text-sm text-green-600 mt-1 break-all">
                  {window.location.origin}/r/{newToken.token}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyLink(newToken.token)}
                  className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                >
                  <Copy size={14} />
                  {t('common.copy')}
                </button>
                <button 
                  onClick={() => setNewToken(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Respondents Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {hasSession && (
                    <th className="text-left px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredRespondents.length && filteredRespondents.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.name')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.ico')}</th>
                  {hasSession && (
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.token')}</th>
                  )}
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.opened')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.validUntil')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('respondents.tableHeaders.status')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRespondents.length === 0 ? (
                  <tr>
                    <td colSpan={hasSession ? 7 : 5} className="px-4 py-12 text-center text-gray-500">
                      <Users className="mx-auto mb-3 text-gray-300" size={48} />
                      <p>{t('respondents.noRespondents')}</p>
                      {hasSession && (
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="btn btn-primary mt-4"
                        >
                          <Plus size={18} />
                          {t('respondents.addFirst')}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : filteredRespondents.map((respondent) => {
                  const displayStatus = getDisplayStatus(respondent);
                  const StatusIcon = statusBadge[displayStatus]?.icon || Clock;
                  const validity = getValidityStatus(respondent);
                  
                  return (
                    <tr key={respondent.id} className="hover:bg-gray-50">
                      {hasSession && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(respondent.id)}
                            onChange={() => toggleSelect(respondent.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <p className="font-medium">{respondent.name}</p>
                        {respondent.email && (
                          <p className="text-xs text-gray-400">{respondent.email}</p>
                        )}
                        {respondent.internal_note && (
                          <p className="text-xs text-gray-400 italic">{respondent.internal_note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{respondent.ico || '-'}</td>
                      {hasSession && (
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {respondent.token || '-'}
                          </code>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {respondent.first_accessed_at ? (
                          <span className="text-green-600">
                            {formatDateTime(respondent.first_accessed_at)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={validity === 'expired' ? 'text-red-600' : ''}>
                          {formatDateTime(respondent.valid_until)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusBadge[displayStatus]?.class}`}>
                          <StatusIcon size={12} className="inline mr-1" />
                          {statusBadge[displayStatus]?.label}
                        </span>
                        {validity === 'not_yet' && (
                          <span className="badge bg-yellow-100 text-yellow-800 ml-1">{t('respondents.validity.notYet')}</span>
                        )}
                        {validity === 'expired' && (
                          <span className="badge bg-red-100 text-red-800 ml-1">{t('respondents.validity.expired')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {respondent.status === 'submitted' && (
                            <Link
                              to={`/e/${code}/submissions/${respondent.id}`}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Zobrazit odpovědi"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          {hasSession && respondent.token && (
                            <button
                              onClick={() => copyLink(respondent.token)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title={`Kopírovat odkaz (${respondent.token})`}
                            >
                              <Copy size={16} />
                            </button>
                          )}
                          {hasSession && (
                            <>
                              <button
                                onClick={() => setShowEditModal(respondent)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Upravit"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(respondent.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Smazat"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <RespondentModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRespondent}
          title={t('respondents.addRespondent')}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <RespondentModal 
          respondent={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSubmit={(data) => handleEditRespondent(showEditModal.id, data)}
          title={t('common.edit')}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImport}
        />
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <BulkUpdateModal
          count={selectedIds.size}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkUpdate}
        />
      )}
    </div>
  );
}

function RespondentModal({ respondent, onClose, onSubmit, title }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: respondent?.name || '',
    ico: respondent?.ico || '',
    email: respondent?.email || '',
    internalNote: respondent?.internal_note || '',
    validFrom: respondent?.valid_from ? new Date(respondent.valid_from).toISOString().slice(0, 16) : '',
    validUntil: respondent?.valid_until ? new Date(respondent.valid_until).toISOString().slice(0, 16) : ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body space-y-4">
            <div>
              <label className="label">{t('respondents.form.name')} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input w-full"
                placeholder={t('respondents.form.namePlaceholder')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('respondents.form.ico')}</label>
                <input
                  type="text"
                  value={form.ico}
                  onChange={(e) => setForm({ ...form, ico: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">{t('respondents.form.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
            <div>
              <label className="label">{t('respondents.form.note')}</label>
              <input
                type="text"
                value={form.internalNote}
                onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
                className="input w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('respondents.form.validFrom')}</label>
                <input
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">{t('respondents.form.validUntil')}</label>
                <input
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
          <div className="card-footer flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <span className="spinner"></span> : (respondent ? <Check size={18} /> : <Plus size={18} />)}
              {respondent ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onSubmit }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lines = text.trim().split('\n');
    const respondents = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return {
        name: parts[0] || '',
        ico: parts[1] || '',
        email: parts[2] || ''
      };
    }).filter(r => r.name);

    if (respondents.length === 0) {
      return;
    }

    setSubmitting(true);
    await onSubmit(respondents);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">{t('common.import')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body space-y-4">
            <p className="text-sm text-gray-600">
              {t('respondents.form.name')}, {t('respondents.form.ico')}, {t('common.email')}
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input w-full h-48 font-mono text-sm"
              placeholder="Firma s.r.o., 12345678, kontakt@firma.cz
Jiná firma a.s., 87654321, info@jina.cz"
              required
            />
          </div>
          <div className="card-footer flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <span className="spinner"></span> : <Upload size={18} />}
              {t('common.import')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkUpdateModal({ count, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    validFrom: '',
    validUntil: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">{t('respondents.bulkActions')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body space-y-4">
            <p className="text-sm text-gray-600">
              {count} {t('respondents.selected')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('respondents.form.validFrom')}</label>
                <input
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">{t('respondents.form.validUntil')}</label>
                <input
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
          <div className="card-footer flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <span className="spinner"></span> : <Check size={18} />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
