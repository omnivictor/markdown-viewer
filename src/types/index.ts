export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  size: number;
  lastModified: number;
  isDirty?: boolean;
}

export interface AppState {
  files: MarkdownFile[];
  activeFileId: string | null;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;
}


export type ViewMode = 'view' | 'edit';
