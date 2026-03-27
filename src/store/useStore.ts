import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, MarkdownFile, Theme, ViewMode } from '@/types';

interface StoreState extends AppState {
  theme: Theme;
  viewMode: ViewMode;
  splitRatio: number;

  // File actions
  openFile: (file: MarkdownFile) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  clearFiles: () => void;

  // Settings actions
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setSplitRatio: (ratio: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      files: [],
      activeFileId: null,
      isDarkMode: true,
      isLoading: false,
      error: null,
      theme: 'system',
      viewMode: 'edit',
      splitRatio: 50,

      openFile: (file) => {
        const { files } = get();
        const existing = files.find(f => f.id === file.id);
        if (existing) {
          set({ activeFileId: file.id, error: null });
        } else {
          set({ files: [...files, file], activeFileId: file.id, error: null });
        }
      },

      closeFile: (id) => {
        const { files, activeFileId } = get();
        const index = files.findIndex(f => f.id === id);
        const newFiles = files.filter(f => f.id !== id);

        let newActiveId = activeFileId;
        if (activeFileId === id) {
          if (newFiles.length === 0) {
            newActiveId = null;
          } else if (index >= newFiles.length) {
            newActiveId = newFiles[newFiles.length - 1].id;
          } else {
            newActiveId = newFiles[index].id;
          }
        }

        set({ files: newFiles, activeFileId: newActiveId });
      },

      setActiveFile: (id) => set({ activeFileId: id }),

      updateFileContent: (id, content) => {
        const { files } = get();
        set({
          files: files.map(f =>
            f.id === id ? { ...f, content, size: content.length, lastModified: Date.now() } : f
          ),
        });
      },

      clearFiles: () => set({ files: [], activeFileId: null }),

      setTheme: (theme) => set({ theme }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSplitRatio: (ratio) => set({ splitRatio: Math.min(80, Math.max(20, ratio)) }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'markdown-viewer-storage',
      partialize: (state) => ({
        theme: state.theme,
        isDarkMode: state.isDarkMode,
        viewMode: state.viewMode,
        splitRatio: state.splitRatio,
      }),
    }
  )
);

// Computed helper
export function getActiveFile(state: StoreState): MarkdownFile | null {
  return state.files.find(f => f.id === state.activeFileId) || null;
}
