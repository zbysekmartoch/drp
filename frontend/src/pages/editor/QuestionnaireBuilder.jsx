import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileQuestion, 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Save,
  Eye,
  ArrowLeft,
  Edit3,
  Users,
  BarChart3,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Sliders,
  Upload,
  Home,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useToast } from '../../context/ToastContext';
import { updateDefinition } from '../../api';

// Question types will be localized inside component
const QUESTION_TYPE_IDS = ['short_text', 'long_text', 'radio', 'checkbox', 'scale', 'file'];
const QUESTION_TYPE_ICONS = {
  short_text: Type,
  long_text: AlignLeft,
  radio: Circle,
  checkbox: CheckSquare,
  scale: Sliders,
  file: Upload
};

export default function QuestionnaireBuilder() {
  const { questionnaire, refreshQuestionnaire, code } = useEditor();
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [definition, setDefinition] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Localized question types
  const QUESTION_TYPES = [
    { id: 'short_text', label: t('editor.questionTypes.text'), icon: Type },
    { id: 'long_text', label: t('editor.questionTypes.textarea'), icon: AlignLeft },
    { id: 'radio', label: t('editor.questionTypes.radio'), icon: Circle },
    { id: 'checkbox', label: t('editor.questionTypes.checkbox'), icon: CheckSquare },
    { id: 'scale', label: t('editor.questionTypes.scale'), icon: Sliders },
    { id: 'file', label: t('editor.questionTypes.file'), icon: Upload }
  ];

  useEffect(() => {
    if (questionnaire?.definition) {
      setDefinition(questionnaire.definition);
      // Expand all blocks by default
      const expanded = {};
      questionnaire.definition.blocks?.forEach(b => {
        expanded[b.id] = true;
      });
      setExpandedBlocks(expanded);
    }
  }, [questionnaire]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDefinition(questionnaire.id, definition);
      success('Dotazník uložen');
      refreshQuestionnaire();
    } catch (err) {
      error(err.response?.data?.error || 'Ukládání selhalo');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      title: 'Nový blok',
      description: '',
      questions: []
    };
    setDefinition({
      ...definition,
      blocks: [...(definition.blocks || []), newBlock]
    });
    setExpandedBlocks({ ...expandedBlocks, [newBlock.id]: true });
  };

  const updateBlock = (blockId, updates) => {
    setDefinition({
      ...definition,
      blocks: definition.blocks.map(b => 
        b.id === blockId ? { ...b, ...updates } : b
      )
    });
  };

  const deleteBlock = (blockId) => {
    if (!confirm('Opravdu chcete smazat tento blok?')) return;
    setDefinition({
      ...definition,
      blocks: definition.blocks.filter(b => b.id !== blockId)
    });
  };

  // Generate next variable name
  const getNextVariableName = () => {
    const allQuestions = definition.blocks?.flatMap(b => b.questions) || [];
    const existingVars = allQuestions.map(q => q.variable).filter(Boolean);
    let num = 1;
    while (existingVars.includes(`var${String(num).padStart(2, '0')}`)) {
      num++;
    }
    return `var${String(num).padStart(2, '0')}`;
  };

  const addQuestion = (blockId, type) => {
    const variable = getNextVariableName();
    const newQuestion = {
      id: `q-${Date.now()}`,
      type,
      variable,
      label: 'Nová otázka',
      description: '',
      required: false,
      options: type === 'radio' || type === 'checkbox' ? [
        { id: 'opt-1', label: 'Možnost 1', value: 'val01' },
        { id: 'opt-2', label: 'Možnost 2', value: 'val02' }
      ] : undefined,
      scaleConfig: type === 'scale' ? {
        min: 0,
        max: 1,
        step: 0.25,
        labels: [
          { value: 0, label: 'Zcela nesouhlasím' },
          { value: 1, label: 'Zcela souhlasím' }
        ]
      } : undefined
    };

    setDefinition({
      ...definition,
      blocks: definition.blocks.map(b => 
        b.id === blockId 
          ? { ...b, questions: [...b.questions, newQuestion] }
          : b
      )
    });
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (blockId, questionId, updates) => {
    setDefinition({
      ...definition,
      blocks: definition.blocks.map(b => 
        b.id === blockId 
          ? { 
              ...b, 
              questions: b.questions.map(q => 
                q.id === questionId ? { ...q, ...updates } : q
              )
            }
          : b
      )
    });
  };

  const deleteQuestion = (blockId, questionId) => {
    setDefinition({
      ...definition,
      blocks: definition.blocks.map(b => 
        b.id === blockId 
          ? { ...b, questions: b.questions.filter(q => q.id !== questionId) }
          : b
      )
    });
  };

  const toggleBlockExpand = (blockId) => {
    setExpandedBlocks({
      ...expandedBlocks,
      [blockId]: !expandedBlocks[blockId]
    });
  };

  if (!definition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
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
                <h1 className="text-lg font-bold text-gray-900">{questionnaire?.title}</h1>
                <p className="text-sm text-gray-500">{t('editor.title')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? <span className="spinner"></span> : <Save size={18} />}
                {t('common.save')}
              </button>
              <a href="/" className="btn btn-secondary btn-sm" title={t('nav.home')}>
                <Home size={16} />
              </a>
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
            <Link to={`/e/${code}/builder`} className="nav-tab active">
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Blocks */}
        <div className="space-y-4">
          {definition.blocks?.map((block, blockIndex) => (
            <div key={block.id} className="card">
              {/* Block Header */}
              <div 
                className="card-header flex items-center justify-between cursor-pointer"
                onClick={() => toggleBlockExpand(block.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="text-gray-400" size={16} />
                  <div>
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1 -ml-1"
                    />
                    <p className="text-sm text-gray-500">
                      {block.questions?.length || 0} otázek
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedBlocks[block.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Block Content */}
              {expandedBlocks[block.id] && (
                <div className="card-body">
                  {/* Block Description */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={block.description || ''}
                      onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                      placeholder="Popis bloku (volitelné)"
                      className="input text-sm"
                    />
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    {block.questions?.map((question, qIndex) => (
                      <QuestionEditor
                        key={question.id}
                        question={question}
                        questionTypes={QUESTION_TYPES}
                        isEditing={editingQuestion === question.id}
                        onEdit={() => setEditingQuestion(
                          editingQuestion === question.id ? null : question.id
                        )}
                        onChange={(updates) => updateQuestion(block.id, question.id, updates)}
                        onDelete={() => deleteQuestion(block.id, question.id)}
                      />
                    ))}
                  </div>

                  {/* Add Question */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">{t('editor.addQuestion')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => addQuestion(block.id, type.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <type.icon size={14} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Block */}
        <button
          onClick={addBlock}
          className="mt-4 w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {t('editor.addBlock')}
        </button>
      </main>
    </div>
  );
}

// Question Editor Component
function QuestionEditor({ question, isEditing, onEdit, onChange, onDelete, questionTypes }) {
  const { t } = useTranslation();
  const typeInfo = questionTypes.find(qt => qt.id === question.type);
  const TypeIcon = typeInfo?.icon || Type;

  return (
    <div className={`border rounded-lg ${isEditing ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}`}>
      {/* Question Header */}
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={onEdit}
      >
        <div className="flex items-center gap-3">
          <TypeIcon size={16} className="text-gray-400" />
          <div>
            <p className={`font-medium ${question.required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
              {question.label || t('editor.questionLabel')}
            </p>
            <p className="text-xs text-gray-500">{typeInfo?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
          {isEditing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Question Editor */}
      {isEditing && (
        <div className="p-4 pt-0 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('editor.questionLabel')}</label>
              <input
                type="text"
                value={question.label || ''}
                onChange={(e) => onChange({ label: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">
                Název proměnné
                <span className="text-xs text-gray-400 ml-1">(pro export)</span>
              </label>
              <input
                type="text"
                value={question.variable || ''}
                onChange={(e) => onChange({ variable: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                className="input font-mono text-sm"
                placeholder="var01"
              />
            </div>
          </div>

          <div>
            <label className="label">Nápověda</label>
            <input
              type="text"
              value={question.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Volitelná nápověda pro respondenta"
              className="input"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required || false}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm">
              {t('editor.questionRequired')}
            </label>
          </div>

          {/* Options for radio/checkbox */}
          {(question.type === 'radio' || question.type === 'checkbox') && (
            <div>
              <label className="label">{t('editor.options.title')}</label>
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={option.id} className="flex gap-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[index] = { ...option, label: e.target.value };
                        onChange({ options: newOptions });
                      }}
                      className="input flex-1"
                      placeholder={t('editor.options.optionLabel')}
                    />
                    <input
                      type="text"
                      value={option.value || ''}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[index] = { ...option, value: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') };
                        onChange({ options: newOptions });
                      }}
                      className="input w-24 font-mono text-sm"
                      placeholder={`val${String(index + 1).padStart(2, '0')}`}
                      title={t('editor.options.optionValue')}
                    />
                    <button
                      onClick={() => {
                        onChange({ 
                          options: question.options.filter((_, i) => i !== index) 
                        });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const nextNum = (question.options?.length || 0) + 1;
                    onChange({
                      options: [
                        ...(question.options || []),
                        { 
                          id: `opt-${Date.now()}`, 
                          label: `Option ${nextNum}`,
                          value: `val${String(nextNum).padStart(2, '0')}`
                        }
                      ]
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} />
                  {t('editor.options.addOption')}
                </button>
              </div>
            </div>
          )}

          {/* Scale configuration */}
          {question.type === 'scale' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">{t('editor.scale.min')}</label>
                  <input
                    type="number"
                    step="any"
                    value={question.scaleConfig?.min ?? 0}
                    onChange={(e) => onChange({ 
                      scaleConfig: { ...question.scaleConfig, min: parseFloat(e.target.value) || 0 } 
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t('editor.scale.max')}</label>
                  <input
                    type="number"
                    step="any"
                    value={question.scaleConfig?.max ?? 1}
                    onChange={(e) => onChange({ 
                      scaleConfig: { ...question.scaleConfig, max: parseFloat(e.target.value) || 1 } 
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t('editor.scale.step')}</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={question.scaleConfig?.step ?? 0.25}
                    onChange={(e) => onChange({ 
                      scaleConfig: { ...question.scaleConfig, step: parseFloat(e.target.value) || 0.25 } 
                    })}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">{t('editor.scale.labels')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      const labels = question.scaleConfig?.labels || [];
                      const newValue = labels.length > 0 
                        ? Math.round((labels[labels.length - 1].value + (question.scaleConfig?.step || 0.25)) * 100) / 100
                        : 0;
                      onChange({
                        scaleConfig: {
                          ...question.scaleConfig,
                          labels: [...labels, { value: newValue, label: '' }]
                        }
                      });
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('editor.scale.addLabel')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(question.scaleConfig?.labels || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="any"
                        value={item.value}
                        onChange={(e) => {
                          const labels = [...(question.scaleConfig?.labels || [])];
                          labels[idx] = { ...labels[idx], value: parseFloat(e.target.value) || 0 };
                          onChange({ scaleConfig: { ...question.scaleConfig, labels } });
                        }}
                        className="input w-24"
                        placeholder={t('editor.scale.valuePlaceholder')}
                      />
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const labels = [...(question.scaleConfig?.labels || [])];
                          labels[idx] = { ...labels[idx], label: e.target.value };
                          onChange({ scaleConfig: { ...question.scaleConfig, labels } });
                        }}
                        className="input flex-1"
                        placeholder={t('editor.scale.labelPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const labels = (question.scaleConfig?.labels || []).filter((_, i) => i !== idx);
                          onChange({ scaleConfig: { ...question.scaleConfig, labels } });
                        }}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!question.scaleConfig?.labels || question.scaleConfig.labels.length === 0) && (
                    <p className="text-sm text-gray-400 italic">{t('editor.scale.noLabels')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* File settings */}
          {question.type === 'file' && (
            <div>
              <label className="label">{t('editor.file.maxFiles')}</label>
              <input
                type="number"
                min="1"
                max="10"
                value={question.maxFiles || 1}
                onChange={(e) => onChange({ maxFiles: parseInt(e.target.value) })}
                className="input w-24"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
