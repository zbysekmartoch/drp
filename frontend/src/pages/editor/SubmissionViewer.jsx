import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  ArrowLeft,
  Edit3,
  Users,
  BarChart3,
  LogOut,
  Download,
  User,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useToast } from '../../context/ToastContext';
import { getSubmission } from '../../api';

export default function SubmissionViewer() {
  const { respondentId } = useParams();
  const { questionnaire, logout, code } = useEditor();
  const { t } = useTranslation();
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [respondentId, questionnaire?.id]);

  const loadSubmission = async () => {
    if (!questionnaire?.id || !respondentId) return;
    
    try {
      const response = await getSubmission(questionnaire.id, respondentId);
      setData(response.data);
    } catch (err) {
      error(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const getQuestionLabel = (questionId) => {
    if (!questionnaire?.definition?.blocks) return questionId;
    
    for (const block of questionnaire.definition.blocks) {
      for (const question of block.questions || []) {
        if (question.id === questionId) {
          return question.label || questionId;
        }
      }
    }
    return questionId;
  };

  const formatAnswer = (value, questionId) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Bez odpovědi</span>;
    }
    
    if (Array.isArray(value)) {
      return value.length > 0 
        ? value.join(', ') 
        : <span className="text-gray-400 italic">Bez odpovědi</span>;
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('errors.notFound')}</p>
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
              <Link to={`/e/${code}/respondents`} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t('responses.title')}</h1>
                <p className="text-sm text-gray-500">{data.respondent?.name}</p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              <LogOut size={16} />
            </button>
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
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Respondent Info */}
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="font-semibold">Informace o respondentovi</h2>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">{t('respondents.tableHeaders.name')}</p>
                  <p className="font-medium">{data.respondent?.name}</p>
                </div>
              </div>
              {data.respondent?.ico && (
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">{t('respondents.tableHeaders.ico')}</p>
                    <p className="font-medium">{data.respondent.ico}</p>
                  </div>
                </div>
              )}
              {data.submission?.submittedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">{t('respondents.statuses.submitted')}</p>
                    <p className="font-medium">
                      {new Date(data.submission.submittedAt).toLocaleString('cs-CZ')}
                    </p>
                  </div>
                </div>
              )}
              {data.respondent?.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">{t('respondents.tableHeaders.validUntil')}</p>
                    <p className="font-medium">
                      {new Date(data.respondent.deadline).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {data.respondent?.internalNote && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">{t('respondents.form.note')}</p>
                <p className="text-gray-700">{data.respondent.internalNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Answers */}
        {data.submission ? (
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">{t('responses.title')}</h2>
            </div>
            <div className="card-body">
              {questionnaire?.definition?.blocks?.map((block) => (
                <div key={block.id} className="mb-8 last:mb-0">
                  <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">
                    {block.title}
                  </h3>
                  <div className="space-y-4">
                    {block.questions?.map((question) => {
                      const answer = data.submission.data?.[question.id];
                      return (
                        <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 mb-1">
                            {question.label}
                          </p>
                          <p className="text-gray-900">
                            {formatAnswer(answer, question.id)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Files */}
              {data.submission.files?.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-4">
                    <Download size={18} className="inline mr-2" />
                    {t('form.uploadedFiles')}
                  </h3>
                  <div className="space-y-2">
                    {data.submission.files.map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{file.original_name}</p>
                          <p className="text-sm text-gray-500">
                            {getQuestionLabel(file.question_id)} • {(file.size_bytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-12 text-gray-500">
              <FileText className="mx-auto mb-3 text-gray-300" size={48} />
              <p>{t('responses.noResponses')}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
