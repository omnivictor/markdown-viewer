'use client';

import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { generateId, validateMarkdownFile } from '@/lib/utils';
import { MarkdownFile } from '@/types';

export default function FileUpload() {
  const { setCurrentFile, setLoading, setError } = useStore();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateMarkdownFile(file)) {
      setError('Please upload a valid markdown file (.md, .markdown, .txt)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const markdownFile: MarkdownFile = {
        id: generateId(),
        name: file.name,
        content,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
      };

      setCurrentFile(markdownFile);
    } catch (_error) {
      setError('Failed to read file. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setCurrentFile, setLoading, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center space-y-4">
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop your markdown file here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
            <input
              type="file"
              className="hidden"
              accept=".md,.markdown,.txt"
              onChange={handleFileSelect}
            />
            Choose File
          </label>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Supports .md, .markdown, .txt files up to 10MB
        </p>
      </div>
    </div>
  );
}