import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Users, 
  Eye,
  Copy,
  BarChart3,
  ArrowLeft,
  Search,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { getQuestionnairePublic, getRespondentsPublic } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function RespondentList() {
  const { id } = useParams();
  const { error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [qResponse, rResponse] = await Promise.all([
        getQuestionnairePublic(id),
        getRespondentsPublic(id)
      ]);
      setQuestionnaire(qResponse.data);
      setRespondents(rResponse.data);
    } catch (err) {
      error('Nepodařilo se načíst data');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = {
    invited: { label: 'Pozván', class: 'badge-invited', icon: Clock },
    in_progress: { label: 'Rozpracováno', class: 'badge-in_progress', icon: Edit3 },
    submitted: { label: 'Odesláno', class: 'badge-submitted', icon: CheckCircle },
    locked: { label: 'Uzamčeno', class: 'badge-locked', icon: AlertCircle }
  };

  const filteredRespondents = respondents.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.ico?.includes(search) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

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
                <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                <p className="text-sm text-gray-500">Respondenti</p>
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
            <Link to={`/q/${id}`} className="nav-tab">
              <BarChart3 size={16} className="inline mr-1" />
              Přehled
            </Link>
            <Link to={`/q/${id}/respondents`} className="nav-tab active">
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
        {/* Info about adding respondents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Poznámka:</strong> Pro přidání nových respondentů nebo generování odkazů je potřeba 
            <Link to={`/e/${questionnaire.code}/login`} className="text-blue-600 underline ml-1">
              přihlásit se k editaci
            </Link>.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Hledat respondenty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button onClick={loadData} className="btn btn-secondary">
            <RefreshCw size={18} />
            Obnovit
          </button>
        </div>

        {/* Respondents Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Jméno / Název</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">IČO</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Odesláno</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Deadline</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRespondents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <Users className="mx-auto mb-2 text-gray-300" size={40} />
                      <p>Žádní respondenti</p>
                    </td>
                  </tr>
                ) : (
                  filteredRespondents.map((respondent) => {
                    const status = statusBadge[respondent.status] || statusBadge.invited;
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={respondent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{respondent.name}</p>
                            {respondent.email && (
                              <p className="text-sm text-gray-500">{respondent.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {respondent.ico || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${status.class}`}>
                            <StatusIcon size={12} className="mr-1" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {respondent.submitted_at 
                            ? new Date(respondent.submitted_at).toLocaleDateString('cs-CZ')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {respondent.deadline 
                            ? new Date(respondent.deadline).toLocaleDateString('cs-CZ')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {(respondent.status === 'submitted' || respondent.status === 'in_progress') && (
                              <Link
                                to={`/q/${id}/submissions/${respondent.id}`}
                                className="btn btn-secondary btn-sm"
                                title="Zobrazit odpovědi"
                              >
                                <Eye size={14} />
                                Odpovědi
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
