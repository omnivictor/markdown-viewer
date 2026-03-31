import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, MarkdownFile, ViewMode } from '@/types';

// Debounced localStorage to avoid excessive writes during typing
const DEBOUNCE_MS = 500;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => localStorage.setItem(name, value), DEBOUNCE_MS);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}));

interface StoreState extends AppState {
  viewMode: ViewMode;
  splitRatio: number;

  // File actions
  openFile: (file: MarkdownFile) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  clearFiles: () => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  renameFile: (id: string, name: string) => void;

  // Settings actions
  setViewMode: (mode: ViewMode) => void;
  setSplitRatio: (ratio: number) => void;
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

      reorderFiles: (fromIndex, toIndex) => {
        const { files } = get();
        const updated = [...files];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        set({ files: updated });
      },

      renameFile: (id, name) => {
        const { files } = get();
        set({ files: files.map(f => f.id === id ? { ...f, name } : f) });
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      setSplitRatio: (ratio) => set({ splitRatio: Math.min(80, Math.max(20, ratio)) }),
      setError: (error) => set({ error }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'markdown-viewer-storage',
      storage: debouncedStorage,
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        viewMode: state.viewMode,
        splitRatio: state.splitRatio,
        files: state.files,
        activeFileId: state.activeFileId,
      }),
    }
  )
);

// Computed helper
export function getActiveFile(state: StoreState): MarkdownFile | null {
  return state.files.find(f => f.id === state.activeFileId) || null;
}
