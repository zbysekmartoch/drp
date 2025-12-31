import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  Users, 
  Download, 
  Edit3, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Home,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getQuestionnaireByCode, getDashboardByCode, exportDataPublic } from '../../api';

export default function EditorDashboard() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    try {
      const [qResponse, dResponse] = await Promise.all([
        getQuestionnaireByCode(code),
        getDashboardByCode(code)
      ]);
      setQuestionnaire(qResponse.data);
      setDashboard(dResponse.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!questionnaire?.id) return;
    setExporting(true);
    try {
      const response = await exportDataPublic(questionnaire.id, format);
      
      const blob = format === 'csv' 
        ? new Blob([response.data], { type: 'text/csv;charset=utf-8' })
        : response.data;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${code}-export.${format === 'bundle' ? 'zip' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success('Export dokončen');
    } catch (err) {
      error('Export selhal');
    } finally {
      setExporting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    success('Kód zkopírován');
  };

  const statusBadge = {
    draft: { label: 'Koncept', class: 'badge-draft' },
    published: { label: 'Publikováno', class: 'badge-published' },
    archived: { label: 'Archivováno', class: 'badge-archived' }
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
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                  <span className={`badge ${statusBadge[questionnaire.status]?.class}`}>
                    {statusBadge[questionnaire.status]?.label}
                  </span>
                </div>
                <button 
                  onClick={copyCode}
                  className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <Copy size={12} />
                  {code}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Link to={`/e/${code}`} className="nav-tab active">
              <BarChart3 size={16} className="inline mr-1" />
              {t('editor.overview')}
            </Link>
            <Link to={`/e/${code}/builder`} className="nav-tab">
              <Edit3 size={16} className="inline mr-1" />
              {t('editor.builder')}
            </Link>
            <Link to={`/e/${code}/respondents`} className="nav-tab">
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.respondents?.total || 0}</p>
                <p className="text-sm text-gray-500">{t('dashboard.stats.respondents')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.respondents?.accessed || 0}</p>
                <p className="text-sm text-gray-500">{t('dashboard.stats.opened')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.respondents?.in_progress || 0}</p>
                <p className="text-sm text-gray-500">{t('dashboard.stats.inProgress')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.respondents?.submitted || 0}</p>
                <p className="text-sm text-gray-500">{t('dashboard.stats.responses')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">{t('dashboard.quickActions')}</h2>
            </div>
            <div className="card-body space-y-3">
              <Link 
                to={`/e/${code}/builder`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="text-primary-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium">{t('dashboard.editQuestionnaire')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.editDescription')}</p>
                </div>
              </Link>

              <Link 
                to={`/e/${code}/respondents`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Users className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium">{t('dashboard.manageRespondents')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.respondentsDescription')}</p>
                </div>
              </Link>

              <Link 
                to={`/e/${code}/responses`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <FileText className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium">{t('dashboard.viewResponses')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.responsesDescription')}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Export */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">{t('dashboard.exportData')}</h2>
            </div>
            <div className="card-body space-y-3">
              <button 
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Download className="text-gray-600" size={20} />
                <div className="text-left">
                  <p className="font-medium">{t('dashboard.exportCSV')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.exportCSVDesc')}</p>
                </div>
              </button>

              <button 
                onClick={() => handleExport('xlsx')}
                disabled={exporting}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Download className="text-green-600" size={20} />
                <div className="text-left">
                  <p className="font-medium">{t('dashboard.exportExcel')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.exportExcelDesc')}</p>
                </div>
              </button>

              <button 
                onClick={() => handleExport('bundle')}
                disabled={exporting}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Download className="text-purple-600" size={20} />
                <div className="text-left">
                  <p className="font-medium">{t('dashboard.exportBundle')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard.exportBundleDesc')}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Versions */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">{t('dashboard.versionHistory')}</h2>
            </div>
            <div className="card-body">
              {dashboard?.versions?.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.versions.map((version) => (
                    <div 
                      key={version.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">Verze {version.version_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(version.published_at).toLocaleString('cs-CZ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>{t('dashboard.noVersions')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">{t('common.description')}</h2>
            </div>
            <div className="card-body">
              {questionnaire.description ? (
                <p className="text-gray-600">{questionnaire.description}</p>
              ) : (
                <p className="text-gray-400 italic">-</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
