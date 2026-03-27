'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { generateId, validateMarkdownFile, DEFAULT_CONTENT } from '@/lib/utils';
import { MarkdownFile } from '@/types';

export default function Header() {
  const { currentFile, setCurrentFile, isDarkMode, toggleDarkMode, setError, viewMode, setViewMode } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

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

    if (file.size > 10 * 1024 * 1024) {
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
      setCurrentFile(markdownFile);
      setError(null);
    } catch (_error) {
      setError('Failed to read file. Please try again.');
    }
  }, [setCurrentFile, setError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDownload = useCallback(async () => {
    if (!currentFile) return;
    
    try {
      // 최신 브라우저에서 File System Access API 지원 확인
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as unknown as any).showSaveFilePicker({
          suggestedName: currentFile.name,
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
        await writable.write(currentFile.content);
        await writable.close();
      } else {
        // 기존 방식 (File System Access API 미지원 브라우저)
        const blob = new Blob([currentFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('파일 저장 오류:', error);
        // 오류 발생 시 기존 방식으로 폴백
        const blob = new Blob([currentFile.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  }, [currentFile]);

  const handleSaveAsMarkdown = useCallback(() => {
    handleDownload();
    setShowSaveDropdown(false);
  }, [handleDownload]);

  const handleSaveAsHTML = useCallback(async () => {
    if (!currentFile) return;
    
    // 현재 미리보기 영역의 HTML을 가져오기
    const previewElement = document.querySelector('.prose');
    if (!previewElement) return;
    
    // HTML 내용을 가져와서 체크박스를 표준 HTML로 변환
    let htmlContent = previewElement.innerHTML;
    
    // 커스텀 체크박스를 표준 HTML 체크박스로 변환
    htmlContent = htmlContent.replace(
      /<div class="relative inline-block w-4 h-4 mr-2 mt-1">[\s\S]*?<\/div>/g,
      (match) => {
        const isChecked = match.includes('stroke="currentColor"');
        return `<input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="margin-right: 8px; transform: scale(1.2);">`;
      }
    );
    
    const fullHtmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentFile.name}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            color: #333;
        }
        h1 { 
            border-bottom: 2px solid #eee; 
            padding-bottom: 10px; 
            font-size: 24px;
            margin-bottom: 16px;
        }
        h2 { 
            border-bottom: 1px solid #eee; 
            padding-bottom: 5px; 
            font-size: 20px;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        h3 { 
            font-size: 18px;
            margin-top: 16px;
            margin-bottom: 8px;
        }
        p {
            margin-bottom: 16px;
        }
        code { 
            background: #f4f4f4; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
        }
        pre { 
            background: #f8f8f8; 
            padding: 16px; 
            border-radius: 6px; 
            overflow-x: auto; 
            border: 1px solid #e1e4e8;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote { 
            border-left: 4px solid #0066cc; 
            margin: 16px 0; 
            padding-left: 16px; 
            color: #666; 
            font-style: italic;
            background: #f0f8ff;
            padding: 12px 16px;
            border-radius: 0 4px 4px 0;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 16px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: 600;
            color: #333;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        ul, ol {
            margin: 16px 0;
            padding-left: 24px;
        }
        li {
            margin: 4px 0;
            line-height: 1.5;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        hr {
            border: none;
            height: 2px;
            background: #eee;
            margin: 24px 0;
        }
        /* 체크박스 스타일 */
        input[type="checkbox"] {
            margin-right: 8px;
            transform: scale(1.2);
            accent-color: #6b7280;
        }
        strong {
            font-weight: 600;
        }
        em {
            font-style: italic;
            color: #666;
        }
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
          suggestedName: currentFile.name.replace(/\.md$/, '.html'),
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
        a.download = currentFile.name.replace(/\.md$/, '.html');
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
        a.download = currentFile.name.replace(/\.md$/, '.html');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    
    setShowSaveDropdown(false);
  }, [currentFile]);



  const handleNewFile = useCallback(() => {
    setCurrentFile({
      id: generateId(),
      name: 'untitled.md',
      content: '# New Document\n\nStart typing here...',
      size: 0,
      lastModified: Date.now(),
    });
  }, [setCurrentFile]);

  const handleReset = useCallback(() => {
    setCurrentFile(null);
    setError(null);

    setTimeout(() => {
      setCurrentFile({
        id: generateId(),
        name: 'demo.md',
        content: DEFAULT_CONTENT,
        size: DEFAULT_CONTENT.length,
        lastModified: Date.now(),
      });
    }, 10);
  }, [setCurrentFile, setError]);

  return (
    <header 
      className="border-b transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        color: isDarkMode ? '#ffffff' : '#111827'
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">
            {viewMode === 'view' ? 'Markdown Viewer' : 'Markdown Editor'}
          </h1>
          {currentFile && (
            <span className="text-sm opacity-70">
              {currentFile.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {viewMode === 'edit' && (
            <>
              <button
                onClick={handleNewFile}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                title="Reset to demo content"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Open
              </button>

              {currentFile && (
                <div className="relative save-dropdown">
                  <button
                    onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Save
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSaveDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
                      style={{
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                      }}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleSaveAsMarkdown}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Markdown (.md)
                          </div>
                        </button>

                        <button
                          onClick={handleSaveAsHTML}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            HTML (.html)
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>

          {/* View/Edit mode toggle */}
          <div
            className="flex rounded-md overflow-hidden border"
            style={{ borderColor: isDarkMode ? '#4b5563' : '#d1d5db' }}
          >
            <button
              onClick={() => setViewMode('view')}
              className="inline-flex items-center px-3 py-1.5 text-sm transition-colors"
              style={{
                backgroundColor: viewMode === 'view'
                  ? (isDarkMode ? '#3b82f6' : '#2563eb')
                  : (isDarkMode ? '#374151' : '#f3f4f6'),
                color: viewMode === 'view' ? '#ffffff' : (isDarkMode ? '#d1d5db' : '#4b5563'),
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className="inline-flex items-center px-3 py-1.5 text-sm transition-colors"
              style={{
                backgroundColor: viewMode === 'edit'
                  ? (isDarkMode ? '#3b82f6' : '#2563eb')
                  : (isDarkMode ? '#374151' : '#f3f4f6'),
                color: viewMode === 'edit' ? '#ffffff' : (isDarkMode ? '#d1d5db' : '#4b5563'),
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
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