'use client';

import { useStore, getActiveFile } from '@/store/useStore';

export default function TabBar() {
  const { files, activeFileId, isDarkMode, closeFile, setActiveFile } = useStore();
  const activeFile = useStore(getActiveFile);

  if (files.length === 0) return null;

  const c = isDarkMode ? {
    bg: '#0d1117',
    tabBg: '#161b22',
    tabActiveBg: '#0d1117',
    tabActiveBorder: '#58a6ff',
    text: '#8b949e',
    textActive: '#e6edf3',
    border: '#30363d',
    hoverBg: '#1c2128',
    closeBtnHover: '#b62324',
  } : {
    bg: '#f6f8fa',
    tabBg: '#f6f8fa',
    tabActiveBg: '#ffffff',
    tabActiveBorder: '#0969da',
    text: '#57606a',
    textActive: '#1f2328',
    border: '#d0d7de',
    hoverBg: '#eaeef2',
    closeBtnHover: '#cf222e',
  };

  return (
    <div
      className="flex items-end border-b overflow-x-auto"
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
      }}
    >
      {files.map(file => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            className="group flex items-center flex-shrink-0 px-3 py-1.5 text-xs cursor-pointer border-r"
            style={{
              backgroundColor: isActive ? c.tabActiveBg : c.tabBg,
              color: isActive ? c.textActive : c.text,
              borderColor: c.border,
              borderBottom: isActive ? `2px solid ${c.tabActiveBorder}` : '2px solid transparent',
              marginBottom: '-1px',
            }}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="max-w-[140px] truncate">{file.name}</span>
            <button
              className="ml-2 w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: c.text }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = c.closeBtnHover;
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                (e.currentTarget as HTMLElement).style.color = c.text;
              }}
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
