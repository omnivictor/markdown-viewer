'use client';

import { useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { generateId, validateMarkdownFile } from '@/lib/utils';
import { MarkdownFile } from '@/types';
import Header from '@/components/Header';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const { error, isDarkMode, viewMode, setCurrentFile, setError } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateMarkdownFile(file)) {
      setError('Please upload a valid markdown file (.md, .markdown, .txt)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    file.text().then((content) => {
      const markdownFile: MarkdownFile = {
        id: generateId(),
        name: file.name,
        content,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
      };
      setCurrentFile(markdownFile);
      setError(null);
    }).catch(() => {
      setError('Failed to read file. Please try again.');
    });
  }, [setCurrentFile, setError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  return (
    <ThemeProvider>
      <div
        className="h-screen flex flex-col transition-all duration-300 relative"
        style={{
          backgroundColor: isDarkMode ? '#0d1117' : '#ffffff',
          color: isDarkMode ? '#e6edf3' : '#1f2328'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: isDarkMode ? 'rgba(13,17,23,0.9)' : 'rgba(255,255,255,0.85)' }}
          >
            <div
              className="border-4 border-dashed rounded-2xl p-12 text-center"
              style={{
                borderColor: isDarkMode ? '#58a6ff' : '#2563eb',
                color: isDarkMode ? '#58a6ff' : '#2563eb',
              }}
            >
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-2xl font-bold">Drop your markdown file here</p>
              <p className="text-sm mt-2 opacity-70">.md, .markdown, .txt (max 10MB)</p>
            </div>
          </div>
        )}
        <Header />
        
        {error && (
          <div className={`mx-4 mt-4 p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <main className="flex-1 flex min-h-0">
          {viewMode === 'edit' && (
            <div
              className="w-1/2 border-r transition-colors duration-300"
              style={{
                backgroundColor: isDarkMode ? '#0d1117' : '#ffffff',
                borderColor: isDarkMode ? '#30363d' : '#d0d7de'
              }}
            >
              <MarkdownEditor />
            </div>
          )}

          <div
            className={`${viewMode === 'view' ? 'w-full' : 'w-1/2'} transition-colors duration-300`}
            style={{
              backgroundColor: isDarkMode ? '#0d1117' : '#ffffff'
            }}
          >
            <MarkdownViewer />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
