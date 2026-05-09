import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Lang = 'uz' | 'ru' | 'en';

interface UIState {
  theme: Theme;
  language: Lang; // alias for lang
  lang: Lang;
  sidebarOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Lang) => void;
  setLang: (l: Lang) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
}

const applyTheme = (t: Theme) => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('crm_theme', t);
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: (localStorage.getItem('crm_theme') as Theme) ?? 'light',
  lang: (localStorage.getItem('crm_lang') as Lang) ?? 'uz',
  language: (localStorage.getItem('crm_lang') as Lang) ?? 'uz',
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,

  setTheme: (t) => { applyTheme(t); set({ theme: t }); },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    set({ theme: next });
  },
  setLang: (l) => { localStorage.setItem('crm_lang', l); set({ lang: l, language: l }); },
  setLanguage: (l) => { localStorage.setItem('crm_lang', l); set({ lang: l, language: l }); },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));

const saved = (localStorage.getItem('crm_theme') as Theme) ?? 'light';
document.documentElement.setAttribute('data-theme', saved);
