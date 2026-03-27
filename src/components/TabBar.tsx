'use client';

import { useStore, getActiveFile } from '@/store/useStore';

export default function TabBar() {
  const { files, activeFileId, closeFile, setActiveFile } = useStore();

  if (files.length === 0) return null;

  return (
    <div
      className="gh-tab-bar flex items-end overflow-x-auto"
    >
      {files.map(file => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            className={`gh-tab group ${isActive ? 'gh-tab-active' : ''}`}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="max-w-[140px] truncate">{file.name}</span>
            <button
              type="button"
              className="gh-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              title="Close"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
