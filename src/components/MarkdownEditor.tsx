'use client';

import { useStore, getActiveFile } from '@/store/useStore';
import { DEFAULT_CONTENT, generateId } from '@/lib/utils';
import { useCallback, useRef, useEffect, useState } from 'react';
import EditorToolbar from '@/components/EditorToolbar';
import SearchBar from '@/components/SearchBar';

export default function MarkdownEditor() {
  const { openFile, updateFileContent } = useStore();
  const activeFile = useStore(getActiveFile);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Ctrl+F to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (activeFile) {
      updateFileContent(activeFile.id, content);
    } else {
      openFile({
        id: generateId(),
        name: 'untitled.md',
        content,
        size: content.length,
        lastModified: Date.now(),
      });
    }
  }, [activeFile, updateFileContent, openFile]);

  const handleToolbarChange = useCallback((content: string) => {
    if (activeFile) {
      updateFileContent(activeFile.id, content);
    }
  }, [activeFile, updateFileContent]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const scrollPercentage = textarea.scrollTop / ((textarea.scrollHeight - textarea.clientHeight) || 1);
    window.dispatchEvent(new CustomEvent('editor-scroll', {
      detail: { scrollPercentage }
    }));
  }, []);

  useEffect(() => {
    const handlePreviewScroll = (e: CustomEvent) => {
      if (textareaRef.current) {
        const { scrollPercentage } = e.detail;
        const textarea = textareaRef.current;
        textarea.scrollTop = scrollPercentage * ((textarea.scrollHeight - textarea.clientHeight) || 1);
      }
    };
    window.addEventListener('preview-scroll', handlePreviewScroll as EventListener);
    return () => window.removeEventListener('preview-scroll', handlePreviewScroll as EventListener);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
      <EditorToolbar textareaRef={textareaRef} onContentChange={handleToolbarChange} />
      <textarea
        ref={textareaRef}
        value={activeFile?.content || DEFAULT_CONTENT}
        onChange={handleTextChange}
        onScroll={handleScroll}
        className="gh-editor flex-1 p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed"
        placeholder="Start typing your markdown..."
        spellCheck={false}
      />
    </div>
  );
}
