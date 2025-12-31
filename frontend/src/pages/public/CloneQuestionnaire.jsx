import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  Users, 
  Eye,
  Copy,
  BarChart3,
  ArrowLeft,
  Plus,
  AlertCircle
} from 'lucide-react';
import { getQuestionnairePublic, cloneQuestionnairePublic } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function CloneQuestionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newTitle: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await getQuestionnairePublic(id);
      setQuestionnaire(response.data);
      setFormData(prev => ({
        ...prev,
        newTitle: `${response.data.title} (kopie)`
      }));
    } catch (err) {
      error('Nepodařilo se načíst dotazník');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      error('Hesla se neshodují');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      error('Heslo musí mít alespoň 6 znaků');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await cloneQuestionnairePublic(id, {
        newTitle: formData.newTitle,
        newPassword: formData.newPassword
      });
      
      success('Dotazník byl úspěšně naklonován');
      navigate(`/q/${response.data.id}`);
    } catch (err) {
      error(err.response?.data?.error || 'Klonování selhalo');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/q/${id}`} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Klonovat dotazník</h1>
                <p className="text-sm text-gray-500">Vytvořit kopii: {questionnaire.title}</p>
              </div>
            </div>
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
            <Link to={`/q/${id}/respondents`} className="nav-tab">
              <Users size={16} className="inline mr-1" />
              Respondenti
            </Link>
            <Link to={`/q/${id}/preview`} className="nav-tab">
              <Eye size={16} className="inline mr-1" />
              Náhled
            </Link>
            <Link to={`/q/${id}/clone`} className="nav-tab active">
              <Copy size={16} className="inline mr-1" />
              Klonovat
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Vytvořit kopii dotazníku</h2>
            <p className="text-sm text-gray-500 mt-1">
              Zkopíruje se struktura dotazníku včetně všech otázek. Respondenti a odpovědi se nekopírují.
            </p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Název nového dotazníku *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.newTitle}
                  onChange={(e) => setFormData({ ...formData, newTitle: e.target.value })}
                  required
                />
              </div>

              <hr />

              <div>
                <label className="label">Heslo pro editaci nového dotazníku *</label>
                <input
                  type="password"
                  className="input"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Minimálně 6 znaků"
                  required
                  minLength={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nový dotazník bude mít vlastní heslo pro editaci.
                </p>
              </div>

              <div>
                <label className="label">Potvrzení hesla *</label>
                <input
                  type="password"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Zopakujte heslo"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link to={`/q/${id}`} className="btn btn-secondary">
                  Zrušit
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner"></span>
                  ) : (
                    <Copy size={18} />
                  )}
                  Vytvořit kopii
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
