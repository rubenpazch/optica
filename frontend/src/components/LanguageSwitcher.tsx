import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('i18nextLng', newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      title={i18n.language === 'en' ? 'Switch to Spanish' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <span className="text-sm font-semibold text-gray-700">
        {i18n.language.toUpperCase()}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
