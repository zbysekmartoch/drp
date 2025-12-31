import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Edit3, 
  Users, 
  Eye,
  Copy,
  Download,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Send
} from 'lucide-react';
import { getQuestionnairePublic, getDashboardPublic } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function QuestionnaireView() {
  const { id } = useParams();
  const { error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [qResponse, dResponse] = await Promise.all([
        getQuestionnairePublic(id),
        getDashboardPublic(id)
      ]);
      setQuestionnaire(qResponse.data);
      setDashboard(dResponse.data);
    } catch (err) {
      error('Nepodařilo se načíst dotazník');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = {
    draft: { label: 'Koncept', class: 'badge-draft' },
    published: { label: 'Publikováno', class: 'badge-published' },
    archived: { label: 'Archivováno', class: 'badge-archived' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              <ArrowLeft size={18} />
              Zpět
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusBadge[questionnaire.status] || statusBadge.draft;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                  <span className={`badge ${status.class}`}>{status.label}</span>
                </div>
                <p className="text-sm text-gray-500">{questionnaire.code}</p>
              </div>
            </div>
            <Link to={`/e/${questionnaire.code}/login`} className="btn btn-primary">
              <Edit3 size={18} />
              Editovat
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Link to={`/q/${id}`} className="nav-tab active">
              <BarChart3 size={16} className="inline mr-1" />
              Přehled
            </Link>
            <Link to={`/q/${id}/respondents`} className="nav-tab">
              <Users size={16} className="inline mr-1" />
              Respondenti
            </Link>
            <Link to={`/q/${id}/preview`} className="nav-tab">
              <Eye size={16} className="inline mr-1" />
              Náhled
            </Link>
            <Link to={`/q/${id}/clone`} className="nav-tab">
              <Copy size={16} className="inline mr-1" />
              Klonovat
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
                <p className="text-sm text-gray-500">Respondentů</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.respondents?.in_progress || 0}</p>
                <p className="text-sm text-gray-500">Rozpracováno</p>
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
                <p className="text-sm text-gray-500">Odesláno</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.versions?.length || 0}</p>
                <p className="text-sm text-gray-500">Verzí</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick links */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Rychlé akce</h2>
            </div>
            <div className="card-body space-y-3">
              <Link 
                to={`/e/${questionnaire.code}/login`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium">Editovat dotazník</p>
                  <p className="text-sm text-gray-500">Vyžaduje heslo</p>
                </div>
              </Link>

              <Link 
                to={`/q/${id}/respondents`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Users className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium">Zobrazit respondenty</p>
                  <p className="text-sm text-gray-500">Seznam všech respondentů a jejich odpovědí</p>
                </div>
              </Link>

              <Link 
                to={`/q/${id}/preview`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Eye className="text-blue-600" size={20} />
                <div>
                  <p className="font-medium">Náhled formuláře</p>
                  <p className="text-sm text-gray-500">Zobrazit jak vypadá dotazník pro respondenty</p>
                </div>
              </Link>

              <Link 
                to={`/q/${id}/clone`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Copy className="text-purple-600" size={20} />
                <div>
                  <p className="font-medium">Klonovat dotazník</p>
                  <p className="text-sm text-gray-500">Vytvořit kopii s novým heslem</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Versions */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Historie verzí</h2>
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
                  <p>Zatím nebyla publikována žádná verze</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {questionnaire.description && (
            <div className="card md:col-span-2">
              <div className="card-header">
                <h2 className="font-semibold">Popis</h2>
              </div>
              <div className="card-body">
                <p className="text-gray-600">{questionnaire.description}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
