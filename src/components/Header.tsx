'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useStore, getActiveFile } from '@/store/useStore';
import { generateId, validateMarkdownFile, DEFAULT_CONTENT, MAX_FILE_SIZE } from '@/lib/utils';
import { MarkdownFile } from '@/types';

export default function Header() {
  const { isDarkMode, toggleDarkMode, setError, viewMode, setViewMode, openFile } = useStore();
  const activeFile = useStore(getActiveFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) handleDownload();
        return;
      }
      // Alt+N: New file
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
        return;
      }
      // Alt+O: Open file
      if (e.altKey && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  // 드롭다운 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.save-dropdown')) {
        setShowSaveDropdown(false);
      }
    };

    if (showSaveDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSaveDropdown]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateMarkdownFile(file)) {
      setError('Please upload a valid markdown file (.md, .markdown, .txt)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      const content = await file.text();
      const markdownFile: MarkdownFile = {
        id: generateId(),
        name: file.name,
        content,
        size: file.size,
        lastModified: file.lastModified || Date.now(),
      };
      openFile(markdownFile);
      setError(null);
    } catch (_error) {
      setError('Failed to read file. Please try again.');
    }
  }, [openFile, setError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDownload = useCallback(async () => {
    if (!activeFile) return;
    
    try {
      // 최신 브라우저에서 File System Access API 지원 확인
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as unknown as any).showSaveFilePicker({
          suggestedName: activeFile.name,
          types: [
            {
              description: 'Markdown files',
              accept: {
                'text/markdown': ['.md'],
                'text/plain': ['.md']
              }
            }
          ]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(activeFile.content);
        await writable.close();
      } else {
        // 기존 방식 (File System Access API 미지원 브라우저)
        const blob = new Blob([activeFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('파일 저장 오류:', error);
        // 오류 발생 시 기존 방식으로 폴백
        const blob = new Blob([activeFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  }, [activeFile]);

  const handleSaveAsMarkdown = useCallback(() => {
    handleDownload();
    setShowSaveDropdown(false);
  }, [handleDownload]);

  const handleSaveAsHTML = useCallback(async () => {
    if (!activeFile) return;

    const previewElement = document.querySelector('.prose');
    if (!previewElement) return;

    // Clone and sanitize the preview HTML
    const clone = previewElement.cloneNode(true) as HTMLElement;

    // Remove all style attributes (they contain var() references)
    clone.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
    // Remove all class attributes (Tailwind/app-specific classes)
    clone.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
    // Remove node="[object Object]" and other React artifacts
    clone.querySelectorAll('[node]').forEach(el => el.removeAttribute('node'));
    // Remove copy buttons from code blocks
    clone.querySelectorAll('button').forEach(el => el.remove());

    const htmlContent = clone.innerHTML;

    const fullHtmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${activeFile.name}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 980px; margin: 0 auto; padding: 2rem; color: #1f2328; font-size: 14px; }
  h1 { font-size: 2em; font-weight: 600; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 1em; }
  h2 { font-size: 1.5em; font-weight: 600; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.75em; }
  h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
  p { margin-bottom: 1em; }
  code { background: rgba(175,184,193,0.2); padding: 0.2em 0.4em; border-radius: 3px; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; font-size: 85%; }
  pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; border: 1px solid #d0d7de; }
  pre code { background: none; padding: 0; font-size: 85%; }
  blockquote { border-left: 4px solid #d0d7de; margin: 1em 0; padding: 0 1em; color: #57606a; }
  table { border-collapse: collapse; margin: 1em 0; display: block; overflow-x: auto; max-width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 0.4rem 0.75rem; text-align: left; font-size: 13px; }
  th { background: #f6f8fa; font-weight: 600; }
  ul, ol { margin: 1em 0; padding-left: 1.5rem; }
  ul { list-style-type: disc; }
  ul ul { list-style-type: circle; }
  li { margin: 0.25em 0; }
  a { color: #0969da; text-decoration: none; }
  a:hover { text-decoration: underline; }
  hr { border: none; height: 1px; background: #d0d7de; margin: 1.5em 0; }
  input[type="checkbox"] { margin-right: 0.5em; }
  img { max-width: 100%; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
    
    try {
      // 최신 브라우저에서 File System Access API 지원 확인
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as unknown as any).showSaveFilePicker({
          suggestedName: activeFile.name.replace(/\.md$/, '.html'),
          types: [
            {
              description: 'HTML files',
              accept: {
                'text/html': ['.html'],
                'text/plain': ['.html']
              }
            }
          ]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(fullHtmlContent);
        await writable.close();
      } else {
        // 기존 방식 (File System Access API 미지원 브라우저)
        const blob = new Blob([fullHtmlContent], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name.replace(/\.md$/, '.html');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('HTML 파일 저장 오류:', error);
        // 오류 발생 시 기존 방식으로 폴백
        const blob = new Blob([fullHtmlContent], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name.replace(/\.md$/, '.html');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    
    setShowSaveDropdown(false);
  }, [activeFile]);



  const handleNewFile = useCallback(() => {
    openFile({
      id: generateId(),
      name: 'untitled.md',
      content: '# New Document\n\nStart typing here...',
      size: 0,
      lastModified: Date.now(),
    });
  }, [openFile]);


  return (
    <header className="gh-app-header border-b transition-colors duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">
            {viewMode === 'view' ? 'Markdown Viewer' : 'Markdown Editor'}
          </h1>
          {activeFile && (() => {
            const text = activeFile.content;
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            const readMin = Math.max(1, Math.ceil(words / 200));
            return (
              <span className="text-xs gh-char-count">
                {text.length} chars &middot; {words} words &middot; {readMin} min read
              </span>
            );
          })()}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* New button — always visible */}
          <button
            type="button"
            onClick={handleNewFile}
            className="gh-btn-secondary"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>

          {/* Open button — always visible */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="gh-btn-secondary"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Open
          </button>

          {/* Save dropdown — edit mode only */}
          {viewMode === 'edit' && activeFile && (
            <div className="relative save-dropdown">
              <button
                type="button"
                onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                className="gh-btn-secondary"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save
                <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSaveDropdown && (
                <div className="gh-dropdown">
                  <button
                    type="button"
                    onClick={handleSaveAsMarkdown}
                    className="gh-dropdown-item"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Markdown (.md)
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAsHTML}
                    className="gh-dropdown-item"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    HTML (.html)
                  </button>

                  <button
                    type="button"
                    onClick={() => { window.print(); setShowSaveDropdown(false); }}
                    className="gh-dropdown-item"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vertical divider */}
          <div className="gh-header-divider" aria-hidden="true" />

          {/* View/Edit segmented control */}
          <div className="gh-segmented" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => setViewMode('view')}
              className="gh-segment"
              aria-pressed={viewMode === 'view' ? 'true' : 'false'}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className="gh-segment"
              aria-pressed={viewMode === 'edit' ? 'true' : 'false'}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          {/* Dark mode ghost icon button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="gh-btn-icon"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".md,.markdown,.txt"
          onChange={handleFileSelect}
        />
      </div>
    </header>
  );
}