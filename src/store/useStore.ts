import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, MarkdownFile, Theme, ViewMode } from '@/types';

interface StoreState extends AppState {
  theme: Theme;
  viewMode: ViewMode;
  setCurrentFile: (file: MarkdownFile | null) => void;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, _get) => ({
      currentFile: null,
      isDarkMode: true,
      isLoading: false,
      error: null,
      theme: 'system',
      viewMode: 'edit',

      setCurrentFile: (file) => set({ currentFile: file, error: null }),
      setTheme: (theme) => set({ theme }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'markdown-viewer-storage',
      partialize: (state) => ({ theme: state.theme, isDarkMode: state.isDarkMode, viewMode: state.viewMode }),
    }
  )
);