'use client';

import { useCallback, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { generateId, validateMarkdownFile } from '@/lib/utils';
import { MarkdownFile } from '@/types';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const { error, isDarkMode, viewMode, splitRatio, setSplitRatio, openFile, setError } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    droppedFiles.forEach(async (file) => {
      if (!validateMarkdownFile(file)) return;
      if (file.size > 10 * 1024 * 1024) return;
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
