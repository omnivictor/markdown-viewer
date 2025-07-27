export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  size: number;
  lastModified: number;
}

export interface AppState {
  currentFile: MarkdownFile | null;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark' | 'system';