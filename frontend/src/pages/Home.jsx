import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  Plus, 
  LogOut, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Users,
  ChevronUp,
  ChevronDown,
  Search,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  ExternalLink
} from 'lucide-react';
import { getQuestionnaires, deleteQuestionnaire } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const { user, logout } = useAuth();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const response = await getQuestionnaires();
      setQuestionnaires(response.data);
    } catch (err) {
      console.error('Failed to load questionnaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    setDeleting(true);
    try {
      await deleteQuestionnaire(deleteModal.id);
      setQuestionnaires(questionnaires.filter(q => q.id !== deleteModal.id));
      setDeleteModal(null);
      success('Dotazník byl smazán');
    } catch (err) {
      error(err.response?.data?.error || 'Mazání selhalo');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (q) => {
    navigate(`/e/${q.code}/builder`);
  };

  const handleClone = (q) => {
    navigate(`/q/${q.id}/clone`);
  };

  const handlePreview = (q) => {
    navigate(`/q/${q.id}/preview`);
  };

  const handleResponses = (q) => {
    navigate(`/q/${q.id}/respondents`);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...questionnaires];
    
    // Filter
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(q => 
        q.title?.toLowerCase().includes(s) ||
        q.code?.toLowerCase().includes(s) ||
        q.description?.toLowerCase().includes(s)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle nulls
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';
      
      // Handle dates
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle strings
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      
      if (sortDir === 'asc') {
        return aVal.localeCompare(bVal, 'cs');
      } else {
        return bVal.localeCompare(aVal, 'cs');
      }
    });
    
    return result;
  }, [questionnaires, search, sortField, sortDir]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const statusBadge = {
    draft: { label: 'Koncept', class: 'badge-draft' },
    published: { label: 'Publikováno', class: 'badge-published' },
    archived: { label: 'Archivováno', class: 'badge-archived' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DRP</h1>
                <p className="text-xs text-gray-500">Data Request Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <Link to="/create" className="btn btn-primary">
                <Plus size={18} />
                {t('home.newQuestionnaire')}
              </Link>
              <LanguageSelector />
              <button onClick={handleLogout} className="btn btn-secondary" title={t('common.logout')}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredAndSorted.length} dotazníků
          </div>
        </div>

        {/* Questionnaires grid/table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : questionnaires.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-16">
              <FileQuestion className="mx-auto text-gray-300 mb-4" size={64} />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {t('home.noQuestionnaires')}
              </h2>
              <p className="text-gray-500 mb-6">
                {t('home.createFirst')}
              </p>
              <Link to="/create" className="btn btn-primary">
                <Plus size={18} />
                {t('home.newQuestionnaire')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <span className="flex items-center gap-1">
                        {t('home.tableHeaders.name')} <SortIcon field="title" />
                      </span>
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('code')}
                    >
                      <span className="flex items-center gap-1">
                        {t('home.tableHeaders.code')} <SortIcon field="code" />
                      </span>
                    </th>
                    <th 
                      className="text-center px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('respondent_count')}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {t('home.tableHeaders.respondents')} <SortIcon field="respondent_count" />
                      </span>
                    </th>
                    <th 
                      className="text-center px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('accessed_count')}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {t('home.tableHeaders.opened')} <SortIcon field="accessed_count" />
                      </span>
                    </th>
                    <th 
                      className="text-center px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('submitted_count')}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {t('home.tableHeaders.responses')} <SortIcon field="submitted_count" />
                      </span>
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('updated_at')}
                    >
                      <span className="flex items-center gap-1">
                        {t('home.tableHeaders.updated')} <SortIcon field="updated_at" />
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAndSorted.map((q) => {
                    return (
                      <tr 
                        key={q.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/e/${q.code}`)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{q.title}</p>
                            {q.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {q.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {q.code}
                          </code>
                          {q.latest_version && (
                            <span className="text-xs text-gray-400 ml-2">
                              v{q.latest_version}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Users size={14} />
                            {q.respondent_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 ${
                            q.accessed_count > 0 ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            <Eye size={14} />
                            {q.accessed_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 ${
                            q.submitted_count > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <CheckCircle size={14} />
                            {q.submitted_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {q.updated_at ? new Date(q.updated_at).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(q)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Editovat"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal(q)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Smazat"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick access card */}
        <div className="card max-w-lg mt-8">
          <div className="card-header">
            <h3 className="font-semibold">Přístup pomocí kódu</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">
              Zadejte kód dotazníku pro rychlý přístup:
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const code = e.target.code.value.trim().toUpperCase();
              if (code) {
                navigate(`/e/${code}`);
              }
            }}>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="code"
                  placeholder="např. QNR-2025-A1B2C3D4"
                  className="input flex-1"
                  pattern="[A-Za-z0-9-]+"
                />
                <button type="submit" className="btn btn-secondary">
                  <ExternalLink size={18} />
                  Přejít
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full fade-in">
            <div className="card-header flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{t('home.deleteConfirm.title')}</h2>
                <p className="text-sm text-gray-500">{deleteModal.title}</p>
              </div>
            </div>
            <div className="card-body">
              <p className="text-gray-600 mb-4">
                {t('home.deleteConfirm.message')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="btn btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger"
                >
                  {deleting ? <span className="spinner"></span> : <Trash2 size={18} />}
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        <p>DRP – Data Request Portal</p>
      </footer>
    </div>
  );
}
