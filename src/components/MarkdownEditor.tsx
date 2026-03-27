'use client';

import { useStore } from '@/store/useStore';
import { DEFAULT_CONTENT } from '@/lib/utils';
import { useCallback, useRef, useEffect } from 'react';

export default function MarkdownEditor() {
  const { currentFile, setCurrentFile, isDarkMode } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (currentFile) {
      setCurrentFile({
        ...currentFile,
        content,
      });
    } else {
      // Create a new file if none exists
      setCurrentFile({
        id: Math.random().toString(36).substr(2, 9),
        name: 'untitled.md',
        content,
        size: content.length,
        lastModified: Date.now(),
      });
    }
  }, [currentFile, setCurrentFile]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    
    // Dispatch scroll event for preview synchronization
    window.dispatchEvent(new CustomEvent('editor-scroll', { 
      detail: { scrollPercentage } 
    }));
  }, []);

  // Listen for preview scroll events
  useEffect(() => {
    const handlePreviewScroll = (e: CustomEvent) => {
      if (textareaRef.current) {
        const { scrollPercentage } = e.detail;
        const textarea = textareaRef.current;
        const scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight);
        textarea.scrollTop = scrollTop;
      }
    };

    window.addEventListener('preview-scroll', handlePreviewScroll as EventListener);

    return () => {
      window.removeEventListener('preview-scroll', handlePreviewScroll as EventListener);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div 
        className="flex items-center justify-between p-4 border-b transition-colors duration-300"
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          color: isDarkMode ? '#ffffff' : '#111827'
        }}
      >
        <h2 className="text-lg font-semibold">
          Markdown Editor
        </h2>
        <div className="text-sm opacity-70">
          {currentFile?.content?.length || DEFAULT_CONTENT.length} characters
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={currentFile?.content || DEFAULT_CONTENT}
        onChange={handleTextChange}
        onScroll={handleScroll}
        className="flex-1 p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed transition-colors duration-300"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827'
        }}
        placeholder="Start typing your markdown..."
        spellCheck={false}
      />
    </div>
  );
}