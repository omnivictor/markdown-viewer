import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, MarkdownFile, Theme, ViewMode } from '@/types';

interface StoreState extends AppState {
  theme: Theme;
  viewMode: ViewMode;
  splitRatio: number;
  setCurrentFile: (file: MarkdownFile | null) => void;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setSplitRatio: (ratio: number) => void;
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
      splitRatio: 50,

      setCurrentFile: (file) => set({ currentFile: file, error: null }),
      setTheme: (theme) => set({ theme }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSplitRatio: (ratio) => set({ splitRatio: Math.min(80, Math.max(20, ratio)) }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'markdown-viewer-storage',
      partialize: (state) => ({ theme: state.theme, isDarkMode: state.isDarkMode, viewMode: state.viewMode, splitRatio: state.splitRatio }),
    }
  )
);