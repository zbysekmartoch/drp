import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Users, 
  Eye,
  Copy,
  BarChart3,
  ArrowLeft,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { getQuestionnairePublic } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function QuestionnairePreview() {
  const { id } = useParams();
  const { error } = useToast();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await getQuestionnairePublic(id);
      setQuestionnaire(response.data);
    } catch (err) {
      error('Nepodařilo se načíst dotazník');
    } finally {
      setLoading(false);
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

  const blocks = questionnaire.definition?.blocks || [];
  const currentBlockData = blocks[currentBlock];
  const progress = blocks.length > 0 ? ((currentBlock + 1) / blocks.length) * 100 : 0;

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
                <h1 className="text-lg font-bold text-gray-900">{questionnaire.title}</h1>
                <p className="text-sm text-gray-500">Náhled formuláře</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-yellow-100 text-yellow-700">
                <Eye size={12} className="mr-1" />
                Pouze náhled
              </span>
              <Link to={`/e/${questionnaire.code}/login`} className="btn btn-primary">
                <Edit3 size={18} />
                Editovat
              </Link>
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
            <Link to={`/q/${id}/preview`} className="nav-tab active">
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

      {/* Preview notice */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <p className="text-sm text-yellow-800 text-center">
            Toto je pouze náhled formuláře. Odpovědi zde nelze ukládat.
          </p>
        </div>
      </div>

      {/* Form preview */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        {blocks.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Blok {currentBlock + 1} z {blocks.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {blocks.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12 text-gray-500">
              <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
              <p>Dotazník zatím nemá žádné otázky</p>
              <Link to={`/e/${questionnaire.code}/login`} className="btn btn-primary mt-4">
                <Edit3 size={18} />
                Přidat otázky
              </Link>
            </div>
          </div>
        ) : currentBlockData && (
          <>
            <div className="card fade-in">
              <div className="card-header">
                <h2 className="font-semibold">{currentBlockData.title}</h2>
                {currentBlockData.description && (
                  <p className="text-sm text-gray-500 mt-1">{currentBlockData.description}</p>
                )}
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {currentBlockData.questions?.map((question) => (
                    <PreviewQuestion key={question.id} question={question} />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentBlock(Math.max(0, currentBlock - 1))}
                disabled={currentBlock === 0}
                className="btn btn-secondary"
              >
                <ChevronLeft size={18} />
                Předchozí
              </button>

              <button
                onClick={() => setCurrentBlock(Math.min(blocks.length - 1, currentBlock + 1))}
                disabled={currentBlock === blocks.length - 1}
                className="btn btn-primary"
              >
                Další
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Block navigation */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-2">Bloky:</p>
              <div className="flex flex-wrap gap-2">
                {blocks.map((block, index) => (
                  <button
                    key={block.id}
                    onClick={() => setCurrentBlock(index)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      index === currentBlock
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}. {block.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Preview Question Component (read-only)
function PreviewQuestion({ question }) {
  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            className="input bg-gray-50"
            placeholder="Odpověď respondenta..."
            disabled
          />
        );

      case 'long_text':
        return (
          <textarea
            className="input bg-gray-50 min-h-[100px]"
            placeholder="Odpověď respondenta..."
            disabled
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="option-item opacity-60 cursor-not-allowed">
                <input type="radio" disabled className="w-4 h-4" />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="option-item opacity-60 cursor-not-allowed">
                <input type="checkbox" disabled className="w-4 h-4 rounded" />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="scale-container opacity-60">
            <div className="scale-labels">
              <span>{question.scaleLabels?.min || '0'}</span>
              <span>{question.scaleLabels?.max || '1'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              className="scale-slider"
              disabled
            />
          </div>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center opacity-60">
            <p className="text-gray-400">Oblast pro nahrání souborů</p>
            <p className="text-xs text-gray-300 mt-1">Max. {question.maxFiles || 1} souborů</p>
          </div>
        );

      default:
        return <p className="text-gray-400">Nepodporovaný typ otázky</p>;
    }
  };

  return (
    <div className={`form-question ${question.required ? 'required' : ''}`}>
      <label className="question-label">{question.label}</label>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      {renderInput()}
    </div>
  );
}
