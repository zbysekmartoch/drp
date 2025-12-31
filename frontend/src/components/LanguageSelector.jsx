import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default function LanguageSelector({ className = '' }) {
  const { i18n } = useTranslation();
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  
  const handleChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe size={16} className="text-gray-500" />
      <select
        value={i18n.language}
        onChange={handleChange}
        className="bg-transparent border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
