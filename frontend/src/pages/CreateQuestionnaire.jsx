import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileQuestion, ArrowLeft, Plus } from 'lucide-react';
import { createQuestionnaire } from '../api';
import { useToast } from '../context/ToastContext';

export default function CreateQuestionnaire() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await createQuestionnaire({
        title: formData.title,
        description: formData.description
      });

      success(t('common.success'));
      navigate(`/e/${response.data.code}/builder`);
    } catch (err) {
      error(err.response?.data?.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('create.title')}</h1>
                <p className="text-xs text-gray-500">{t('create.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">{t('create.basicInfo')}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">{t('create.nameLabel')} *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('create.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="label">{t('create.descriptionLabel')}</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('create.descriptionPlaceholder')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link to="/" className="btn btn-secondary">
                  {t('common.cancel')}
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    <Plus size={18} />
                  )}
                  {loading ? t('create.creating') : t('create.createButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
