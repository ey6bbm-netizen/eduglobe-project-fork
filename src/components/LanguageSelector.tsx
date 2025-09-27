import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  headerText: string;
}

const LanguageSelector = ({ selectedLanguage, onLanguageChange, headerText }: LanguageSelectorProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">{headerText}</h3>
      <div className="flex flex-col space-y-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-400 ${
              selectedLanguage === lang
                ? 'bg-violet-500 text-white font-semibold shadow-lg scale-105'
                : 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 border border-slate-600/50 hover:border-slate-500'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
