import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  Users, 
  Edit3, 
  BarChart3,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Home,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getQuestionnaireByCode, getRespondentsByCode, exportDataPublic } from '../../api';

export default function ResponsesOverview() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    try {
      const [qResponse, rResponse] = await Promise.all([
        getQuestionnaireByCode(code),
        getRespondentsByCode(code)
      ]);
      setQuestionnaire(qResponse.data);
      setRespondents(rResponse.data);
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
      a.download = `${code}-odpovedi.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      success(t('common.success'));
    } catch (err) {
      error(t('errors.generic'));
    } finally {
      setExporting(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: respondents.length,
    invited: respondents.filter(r => r.status === 'invited').length,
    inProgress: respondents.filter(r => r.status === 'in_progress').length,
    submitted: respondents.filter(r => r.status === 'submitted').length,
    locked: respondents.filter(r => r.status === 'locked').length
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.submitted / stats.total) * 100) 
    : 0;

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
            <h2 className="text-xl font-semibold mb-2">{t('errors.notFound')}</h2>
            <Link to="/" className="btn btn-primary mt-4">
              {t('common.back')}
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
                title={t('nav.home')}
              >
                <Home size={18} />
                <span className="text-sm font-medium hidden sm:inline">{t('nav.home')}</span>
              </Link>
              <ChevronRight size={16} className="text-gray-300" />
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                <p className="text-sm text-gray-500">{t('responses.title')}</p>
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
              <Lock size={14} className="inline mr-1 text-yellow-600" />
              <Edit3 size={16} className="inline mr-1" />
              {t('editor.builder')}
            </Link>
            <Link to={`/e/${code}/respondents`} className="nav-tab">
              <Users size={16} className="inline mr-1" />
              {t('editor.respondentsTab')}
            </Link>
            <Link to={`/e/${code}/responses`} className="nav-tab active">
              <FileText size={16} className="inline mr-1" />
              {t('editor.responsesTab')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">{t('common.all')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.invited}</p>
                <p className="text-sm text-gray-500">{t('respondents.statuses.notOpened')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit3 className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
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
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-sm text-gray-500">{t('respondents.statuses.submitted')}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-sm text-gray-500">{t('form.progress')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="font-semibold">{t('form.progress')}</h2>
          </div>
          <div className="card-body">
            {stats.total === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {t('respondents.noRespondents')}
              </div>
            ) : (
              <>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                  {stats.submitted > 0 && (
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(stats.submitted / stats.total) * 100}%` }}
                    >
                      {stats.submitted > 0 && stats.submitted}
                    </div>
                  )}
                  {stats.inProgress > 0 && (
                    <div 
                      className="bg-yellow-400 flex items-center justify-center text-gray-800 text-sm font-medium"
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    >
                      {stats.inProgress > 0 && stats.inProgress}
                    </div>
                  )}
                  {stats.invited > 0 && (
                    <div 
                      className="bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium"
                      style={{ width: `${(stats.invited / stats.total) * 100}%` }}
                    >
                      {stats.invited > 0 && stats.invited}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded"></span>
                    Odesláno
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded"></span>
                    Rozpracováno
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-300 rounded"></span>
                    Pozváno
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">{t('dashboard.exportData')}</h2>
          </div>
          <div className="card-body">
            {stats.submitted === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
                <p>{t('responses.noResponses')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="text-green-600" size={24} />
                    <span className="font-semibold">{t('responses.exportCSV')}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('xlsx')}
                  disabled={exporting}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="text-blue-600" size={24} />
                    <span className="font-semibold">{t('responses.exportXLSX')}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('zip')}
                  disabled={exporting}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="text-purple-600" size={24} />
                    <span className="font-semibold">ZIP</span>
                  </div>
                </button>
              </div>
            )}

            {exporting && (
              <div className="mt-4 text-center">
                <div className="spinner w-6 h-6 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{t('common.loading')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        {stats.submitted > 0 && (
          <div className="card mt-8">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold">{t('dashboard.recentResponses')}</h2>
              <Link to={`/e/${code}/respondents`} className="text-sm text-primary-600 hover:underline">
                {t('common.all')} →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('responses.tableHeaders.respondent')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">{t('responses.tableHeaders.submittedAt')}</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {respondents
                    .filter(r => r.status === 'submitted')
                    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
                    .slice(0, 5)
                    .map((respondent) => (
                      <tr key={respondent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{respondent.name}</p>
                          {respondent.ico && (
                            <p className="text-sm text-gray-500">{t('respondents.tableHeaders.ico')}: {respondent.ico}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {respondent.submitted_at 
                            ? new Date(respondent.submitted_at).toLocaleString('cs-CZ')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/e/${code}/submissions/${respondent.id}`}
                            className="text-primary-600 hover:underline text-sm"
                          >
                            {t('dashboard.viewResponses')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
