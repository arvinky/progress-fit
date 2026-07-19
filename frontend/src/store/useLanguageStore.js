import { create } from 'zustand';

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem('language') || 'id', // 'id' (Bahasa Indonesia) or 'en' (English)
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'id' ? 'en' : 'id';
      localStorage.setItem('language', nextLang);
      return { language: nextLang };
    });
  }
}));
