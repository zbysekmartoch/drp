import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuestionnaireByCode } from '../api';

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuestionnaire();
  }, [code]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getQuestionnaireByCode(code);
      setQuestionnaire(response.data);
    } catch (err) {
      console.error('Failed to load questionnaire:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Dotazník nebyl nalezen');
      } else {
        setError(err.response?.data?.error || 'Nepodařilo se načíst dotazník');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshQuestionnaire = () => {
    loadQuestionnaire();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md">
          <div className="card-body text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md">
          <div className="card-body text-center">
            <p className="text-gray-600 mb-4">Dotazník nenalezen</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{
      questionnaire,
      setQuestionnaire,
      refreshQuestionnaire,
      code
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
