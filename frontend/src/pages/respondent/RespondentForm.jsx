import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Trash2, 
  Send,
  ChevronLeft,
  ChevronRight,
  Save,
  FileText,
  Clock,
  Check,
  Download
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getForm, logFormAccess, saveSubmission, submitForm, uploadFile, deleteFile } from '../../api';
import LanguageSelector from '../../components/LanguageSelector';
import jsPDF from 'jspdf';

export default function RespondentForm() {
  const { token } = useParams();
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState(null);
  
  const autosaveTimer = useRef(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    loadForm();
  }, [token]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Autosave
  useEffect(() => {
    if (!formData || submitted) return;
    
    const autosaveSeconds = formData.settings?.autosaveSeconds || 10;
    
    autosaveTimer.current = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0) {
        handleSave(true);
      }
    }, autosaveSeconds * 1000);

    return () => {
      if (autosaveTimer.current) {
        clearInterval(autosaveTimer.current);
      }
    };
  }, [formData, submitted]);

  const loadForm = async () => {
    try {
      const response = await getForm(token);
      setFormData(response.data);
      
      // Log access with browser info
      const browserInfo = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
      logFormAccess(token, browserInfo).catch(() => {}); // Non-blocking
      
      // Load existing answers
      if (response.data.submission?.data) {
        setAnswers(response.data.submission.data);
      }
      
      // Check if already submitted
      if (response.data.submission?.status === 'submitted') {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Nepodařilo se načíst formulář');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async (silent = false) => {
    if (saving || submitted) return;
    
    setSaving(true);
    try {
      await saveSubmission(token, answersRef.current);
      setLastSaved(new Date());
      if (!silent) {
        success('Uloženo');
      }
    } catch (err) {
      if (!silent) {
        showError('Ukládání selhalo');
      }
    } finally {
      setSaving(false);
    }
  }, [token, saving, submitted]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = async (questionId, file) => {
    try {
      const response = await uploadFile(token, questionId, file);
      setFiles(prev => [...prev, response.data]);
      success('Soubor nahrán');
    } catch (err) {
      showError(err.response?.data?.error || 'Nahrávání selhalo');
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      await deleteFile(token, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      success('Soubor smazán');
    } catch (err) {
      showError('Mazání selhalo');
    }
  };

  const validateForm = () => {
    const errors = [];
    const definition = formData.definition;
    
    if (!definition?.blocks) return errors;
    
    for (const block of definition.blocks) {
      for (const question of block.questions || []) {
        if (question.required) {
          const answer = answers[question.id];
          const isEmpty = answer === null || 
                          answer === undefined || 
                          answer === '' || 
                          (Array.isArray(answer) && answer.length === 0);
          
          if (isEmpty) {
            errors.push({
              questionId: question.id,
              blockId: block.id,
              blockTitle: block.title,
              label: question.label
            });
          }
        }
      }
    }
    
    return errors;
  };

  const handleReview = () => {
    const errors = validateForm();
    setValidationErrors(errors);
    setShowReview(true);
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      showError(t('form.requiredField'));
      return;
    }
    
    setSubmitting(true);
    try {
      await submitForm(token, answers);
      setSubmitted(true);
      success(t('form.submitted'));
    } catch (err) {
      showError(err.response?.data?.error || t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-500">Načítání formuláře...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Formulář není dostupný
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDateTime = (dt) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = formData?.respondent?.canEdit;
  const validityStatus = formData?.respondent?.validityStatus;
  const validFrom = formatDateTime(formData?.respondent?.validFrom);
  const validUntil = formatDateTime(formData?.respondent?.validUntil);

  // Show validity info if not currently valid
  if (validityStatus === 'not_yet_valid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <Clock className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dotazník ještě není otevřen
            </h2>
            <p className="text-gray-600 mb-4">
              Vyplňování bude možné od:
            </p>
            <p className="text-lg font-semibold text-primary-600">{validFrom}</p>
            {validUntil && (
              <p className="text-sm text-gray-500 mt-2">do {validUntil}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (validityStatus === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Čas pro vyplnění vypršel
            </h2>
            <p className="text-gray-600 mb-4">
              Vyplňování bylo možné do:
            </p>
            <p className="text-lg font-semibold text-red-600">{validUntil}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const exportToPdf = () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.questionnaire?.title || 'Dotazník', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // Respondent info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Respondent: ${formData.respondent?.name}`, 14, y);
      y += 6;
      doc.text(`Datum: ${new Date().toLocaleDateString('cs-CZ')}`, 14, y);
      y += 12;
      
      // Questions and answers
      const blocks = formData.definition?.blocks || [];
      
      for (const block of blocks) {
        // Check if we need a new page
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        // Block title
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(block.title, 14, y);
        y += 8;
        
        for (const question of block.questions || []) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          // Question
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const questionLines = doc.splitTextToSize(`${question.label}${question.required ? ' *' : ''}`, pageWidth - 28);
          doc.text(questionLines, 14, y);
          y += questionLines.length * 5;
          
          // Answer
          doc.setFont('helvetica', 'normal');
          const answer = answers[question.id];
          let answerText = '';
          
          if (answer === undefined || answer === null || answer === '') {
            answerText = '(bez odpovědi)';
          } else if (Array.isArray(answer)) {
            answerText = answer.join(', ') || '(bez odpovědi)';
          } else {
            answerText = String(answer);
          }
          
          const answerLines = doc.splitTextToSize(answerText, pageWidth - 28);
          doc.text(answerLines, 14, y);
          y += answerLines.length * 5 + 6;
        }
        
        y += 4;
      }
      
      doc.save(`${formData.questionnaire?.code || 'dotaznik'}-${formData.respondent?.name || 'odpoved'}.pdf`);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
        <div className="card max-w-md w-full">
          <div className="card-body text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Děkujeme!
            </h2>
            <p className="text-gray-600 mb-6">
              Váš dotazník byl úspěšně odeslán.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 mb-6">
              <p>Dotazník: {formData.questionnaire?.title}</p>
              <p>Respondent: {formData.respondent?.name}</p>
            </div>
            <button
              onClick={exportToPdf}
              className="btn btn-primary w-full"
            >
              <Download size={18} />
              Stáhnout odpovědi jako PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  const blocks = formData.definition?.blocks || [];
  const currentBlockData = blocks[currentBlock];
  const progress = blocks.length > 0 ? ((currentBlock + 1) / blocks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{formData.questionnaire?.title}</h1>
                <p className="text-sm text-gray-500">{formData.respondent?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Check size={12} />
                  {lastSaved.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button 
                onClick={() => handleSave(false)}
                disabled={saving}
                className="btn btn-secondary btn-sm"
              >
                {saving ? <span className="spinner"></span> : <Save size={16} />}
              </button>
            </div>
          </div>
          
          {/* Validity info */}
          {(validFrom || validUntil) && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <Clock size={14} />
              <span>
                {validFrom && validUntil ? (
                  <>Platnost: {validFrom} – {validUntil}</>
                ) : validFrom ? (
                  <>Od: {validFrom}</>
                ) : (
                  <>Do: {validUntil}</>
                )}
              </span>
            </div>
          )}
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Blok {currentBlock + 1} z {blocks.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Deadline warning */}
      {formData.respondent?.deadline && (
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-sm text-yellow-800">
            <Clock size={16} />
            Termín pro vyplnění: {new Date(formData.respondent.deadline).toLocaleDateString('cs-CZ')}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {showReview ? (
          // Review screen
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Kontrola před odesláním</h2>
            </div>
            <div className="card-body">
              {validationErrors.length > 0 ? (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                      <AlertCircle size={18} />
                      Nevyplněná povinná pole ({validationErrors.length})
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((err) => (
                        <li key={err.questionId}>
                          • {err.blockTitle}: {err.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowReview(false)}
                    className="btn btn-secondary"
                  >
                    Zpět k vyplňování
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-green-800 flex items-center gap-2">
                      <CheckCircle size={18} />
                      Všechna povinná pole jsou vyplněna
                    </h3>
                  </div>

                  {/* Summary */}
                  <div className="space-y-6 mb-6">
                    {blocks.map((block) => (
                      <div key={block.id}>
                        <h4 className="font-medium text-gray-700 mb-2">{block.title}</h4>
                        <div className="space-y-2">
                          {block.questions?.map((question) => {
                            const answer = answers[question.id];
                            return (
                              <div key={question.id} className="bg-gray-50 rounded p-3">
                                <p className="text-sm text-gray-500">{question.label}</p>
                                <p className="text-gray-900">
                                  {answer === null || answer === undefined || answer === '' 
                                    ? <span className="text-gray-400 italic">-</span>
                                    : Array.isArray(answer) 
                                      ? answer.join(', ')
                                      : String(answer)
                                  }
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReview(false)}
                      className="btn btn-secondary"
                    >
                      Zpět k úpravám
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn btn-success"
                    >
                      {submitting ? <span className="spinner"></span> : <Send size={18} />}
                      Odeslat dotazník
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // Form
          <>
            {currentBlockData && (
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
                      <QuestionField
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        files={files.filter(f => f.questionId === question.id)}
                        onFileUpload={(file) => handleFileUpload(question.id, file)}
                        onFileDelete={handleFileDelete}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

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

              {currentBlock === blocks.length - 1 ? (
                <button
                  onClick={handleReview}
                  className="btn btn-primary"
                >
                  Zkontrolovat a odeslat
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentBlock(Math.min(blocks.length - 1, currentBlock + 1))}
                  className="btn btn-primary"
                >
                  Další
                  <ChevronRight size={18} />
                </button>
              )}
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

// Question Field Component
function QuestionField({ question, value, onChange, files, onFileUpload, onFileDelete }) {
  const inputRef = useRef(null);

  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            className="input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Vaše odpověď..."
          />
        );

      case 'long_text':
        return (
          <textarea
            className="input min-h-[120px]"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Vaše odpověď..."
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`option-item ${value === option.label ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={value === option.label}
                  onChange={() => onChange(option.label)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`option-item ${selectedValues.includes(option.label) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.label)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.label]);
                    } else {
                      onChange(selectedValues.filter(v => v !== option.label));
                    }
                  }}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const scaleConfig = question.scaleConfig || { min: 0, max: 1, step: 0.1, labels: [] };
        const minVal = scaleConfig.min ?? 0;
        const maxVal = scaleConfig.max ?? 1;
        const stepVal = scaleConfig.step ?? 0.1;
        const labels = scaleConfig.labels || [];
        const currentValue = value !== undefined ? value : (minVal + maxVal) / 2;
        
        // Find label for current value
        const currentLabel = labels.find(l => l.value === currentValue)?.label;
        
        return (
          <div className="scale-container">
            {/* Labels above slider */}
            {labels.length > 0 && (
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                {labels
                  .sort((a, b) => a.value - b.value)
                  .map((item, idx) => (
                    <div 
                      key={idx} 
                      className="text-center"
                      style={{ 
                        position: 'absolute', 
                        left: `${((item.value - minVal) / (maxVal - minVal)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="font-medium">{item.value}</div>
                    </div>
                  ))
                }
              </div>
            )}
            
            <div className="scale-labels mb-2">
              <span className="text-sm">
                <strong>{minVal}</strong>
                {labels.find(l => l.value === minVal)?.label && (
                  <span className="text-gray-500 ml-1">({labels.find(l => l.value === minVal)?.label})</span>
                )}
              </span>
              <span className="text-sm">
                <strong>{maxVal}</strong>
                {labels.find(l => l.value === maxVal)?.label && (
                  <span className="text-gray-500 ml-1">({labels.find(l => l.value === maxVal)?.label})</span>
                )}
              </span>
            </div>
            
            <input
              type="range"
              min={minVal}
              max={maxVal}
              step={stepVal}
              value={currentValue}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="scale-slider"
            />
            
            <div className="text-center mt-2 text-sm">
              <span className="font-medium text-primary-600">{currentValue}</span>
              {currentLabel && (
                <span className="text-gray-600 ml-2">– {currentLabel}</span>
              )}
            </div>
            
            {/* All labels reference */}
            {labels.length > 2 && (
              <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                {labels.sort((a, b) => a.value - b.value).map((item, idx) => (
                  <div key={idx}>
                    <strong>{item.value}</strong>: {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileUpload(file);
                    e.target.value = '';
                  }
                }}
              />
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 mb-2">
                Přetáhněte soubor nebo{' '}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-primary-600 hover:underline"
                >
                  vyberte z počítače
                </button>
              </p>
              <p className="text-xs text-gray-400">
                Max. {question.maxFiles || 1} souborů, 50 MB na soubor
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="text-gray-400" size={18} />
                      <span className="text-sm">{file.originalName}</span>
                      <span className="text-xs text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => onFileDelete(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
