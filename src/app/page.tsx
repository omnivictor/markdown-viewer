'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { generateId, validateMarkdownFile, MAX_FILE_SIZE } from '@/lib/utils';

import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const { error, isDarkMode, viewMode, splitRatio, setSplitRatio, openFile, setError, clearFiles } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  // Clear file data from localStorage when browser tab/window is closed (not on refresh)
  useEffect(() => {
    // Mark this session as active on every load
    sessionStorage.setItem('md-viewer-active', '1');

    const handleBeforeUnload = () => {
      // sessionStorage persists across refresh but is cleared on tab close.
      // On refresh, the flag is set again immediately above.
      // On tab close, sessionStorage is wiped, so next load won't find the flag.
      // We use a small trick: set a "closing" flag in sessionStorage,
      // then on next load check if it was a refresh (flag exists) or close (flag gone).
      sessionStorage.setItem('md-viewer-closing', '1');
    };

    // Check if this is a fresh open (not a refresh)
    const wasClosing = sessionStorage.getItem('md-viewer-closing');
    if (!wasClosing) {
      // Fresh browser open — clear any leftover file data
      const stored = localStorage.getItem('markdown-viewer-storage');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state) {
            parsed.state.files = [];
            parsed.state.activeFileId = null;
            localStorage.setItem('markdown-viewer-storage', JSON.stringify(parsed));
            clearFiles();
          }
        } catch { /* ignore */ }
      }
    }
    // Clear the closing flag (refresh will re-set it via beforeunload)
    sessionStorage.removeItem('md-viewer-closing');

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [clearFiles]);
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    droppedFiles.forEach(async (file) => {
      if (!validateMarkdownFile(file)) return;
      if (file.size > MAX_FILE_SIZE) return;
      try {
        const content = await file.text();
        openFile({
          id: generateId(),
          name: file.name,
          content,
          size: file.size,
          lastModified: file.lastModified || Date.now(),
        });
      } catch { /* skip */ }
    });
    setError(null);
  }, [openFile, setError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setSplitRatio]);

  return (
    <ThemeProvider>
      <div
        className="gh-canvas h-screen flex flex-col relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="gh-drag-overlay">
            <div className="gh-drag-box">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-2xl font-bold">Drop your markdown files here</p>
              <p className="text-sm mt-2 opacity-70">.md, .markdown, .txt (max 10MB)</p>
            </div>
          </div>
        )}
        <Header />
        <TabBar />

        {error && (
          <div className={`mx-4 mt-2 p-3 rounded-lg border ${
            isDarkMode
              ? 'bg-red-900/20 border-red-800 text-red-400'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <main ref={mainRef} className="flex-1 flex min-h-0">
          {viewMode === 'edit' && (
            <>
              <div className="gh-panel" style={{ width: `${splitRatio}%` }}>
                <MarkdownEditor />
              </div>

              <div
                className={`gh-resize-handle group ${isResizing ? 'gh-resize-active' : ''}`}
                onMouseDown={handleResizeStart}
              >
                <div className="gh-resize-highlight" />
              </div>

              <div className="gh-panel flex-1 min-w-0">
                <MarkdownViewer />
              </div>
            </>
          )}

          {viewMode === 'view' && (
            <div className="gh-panel w-full">
              <MarkdownViewer />
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
