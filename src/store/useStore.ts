import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, MarkdownFile, Theme } from '@/types';

interface StoreState extends AppState {
  theme: Theme;
  setCurrentFile: (file: MarkdownFile | null) => void;
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, _get) => ({
      currentFile: null,
      isDarkMode: false,
      isLoading: false,
      error: null,
      theme: 'system',
      
      setCurrentFile: (file) => set({ currentFile: file, error: null }),
      setTheme: (theme) => set({ theme }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => {
        console.log('toggleDarkMode called'); // 디버깅
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          console.log('Toggling dark mode from', state.isDarkMode, 'to', newDarkMode); // 디버깅
          return { isDarkMode: newDarkMode };
        });
      },
    }),
    {
      name: 'markdown-viewer-storage',
      partialize: (state) => ({ theme: state.theme, isDarkMode: state.isDarkMode }),
    }
  )
);