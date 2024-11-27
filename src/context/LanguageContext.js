import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');

  // Update localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
