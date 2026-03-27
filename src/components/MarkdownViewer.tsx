'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { useStore } from '@/store/useStore';
import { DEFAULT_CONTENT } from '@/lib/utils';
import { useEffect, useRef, type ComponentProps } from 'react';

// Define a type for the custom code component's props
type CodeProps = ComponentProps<'code'> & {
  inline?: boolean;
};

export default function MarkdownViewer() {
  const { currentFile, isDarkMode } = useStore();
  const previewRef = useRef<HTMLDivElement>(null);

  const content = currentFile?.content || DEFAULT_CONTENT;

  useEffect(() => {
    const handleEditorScroll = (e: CustomEvent) => {
      if (previewRef.current) {
        const { scrollPercentage } = e.detail;
        const preview = previewRef.current;
        const scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
        preview.scrollTop = scrollTop;
      }
    };

    window.addEventListener('editor-scroll', handleEditorScroll as EventListener);

    return () => {
      window.removeEventListener('editor-scroll', handleEditorScroll as EventListener);
    };
  }, []);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const preview = e.currentTarget;
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    
    // Dispatch scroll event for editor synchronization
    window.dispatchEvent(new CustomEvent('preview-scroll', { 
      detail: { scrollPercentage } 
    }));
  };

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
          Preview
        </h2>
      </div>
      
      <div 
        ref={previewRef}
        className="flex-1 overflow-y-auto transition-colors duration-300"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
        }}
        onScroll={handlePreviewScroll}
      >
        <div 
          className="prose max-w-none p-6 prose-headings:scroll-mt-16 transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkEmoji, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
            components={{
              // 체크박스와 리스트 아이템 개선
              li: ({ children, className, ...props }) => {
                const stringChildren = children?.toString() || '';
                
                // 체크박스 항목 처리
                if (stringChildren.includes('type="checkbox"')) {
                  return (
                    <li className="flex items-start gap-2 list-none ml-0" {...props}>
                      {children}
                    </li>
                  );
                }
                
                return (
                  <li className={`${className || ''} leading-relaxed`} {...props}>
                    {children}
                  </li>
                );
              },
              
              // 체크박스 렌더링 완전 개선
              input: ({ type, checked, ...props }) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2"
                      style={{
                        accentColor: '#6b7280',
                        transform: 'scale(1.1)',
                        verticalAlign: 'middle'
                      }}
                      {...props}
                    />
                  );
                }
                return <input type={type} checked={checked} {...props} />;
              },
              
              // 제목 개선
              h1: ({ children, ...props }) => (
                <h1 
                  className="text-2xl font-bold mb-4 border-b pb-2" 
                  style={{
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                  }}
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 
                  className="text-xl font-semibold mb-3 mt-6 border-b pb-1" 
                  style={{
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                  }}
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 
                  className="text-lg font-semibold mb-2 mt-4" 
                  style={{
                    color: isDarkMode ? '#f9fafb' : '#111827'
                  }}
                  {...props}
                >
                  {children}
                </h3>
              ),
              
              // 순서 있는 리스트 개선
              ol: ({ children, ...props }) => (
                <ol 
                  className="list-decimal list-inside space-y-2 mb-4 pl-6" 
                  style={{
                    color: isDarkMode ? '#e5e7eb' : '#374151'
                  }}
                  {...props}
                >
                  {children}
                </ol>
              ),
              
              // 순서 없는 리스트 개선
              ul: ({ children, ...props }) => (
                <ul 
                  className="space-y-2 mb-4 pl-6" 
                  style={{
                    color: isDarkMode ? '#e5e7eb' : '#374151'
                  }}
                  {...props}
                >
                  {children}
                </ul>
              ),
              
              // 코드 블록 렌더링 개선
              code: ({ inline, className, children }: CodeProps) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative my-6">
                    <div className="bg-gray-200 dark:bg-gray-800 rounded-t-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 font-medium">
                      {match[1].toUpperCase()}
                    </div>
                    <pre className="!bg-gray-50 dark:!bg-gray-900 !text-gray-900 dark:!text-gray-100 !p-4 !rounded-t-none !rounded-b-lg overflow-x-auto !m-0 border border-gray-200 dark:border-gray-700 border-t-0">
                      <code className={`${className} !bg-transparent !text-inherit`}>
                        {children}
                      </code>
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="absolute top-8 right-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs rounded transition-colors"
                      title="Copy code"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <code className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">
                    {children}
                  </code>
                );
              },
              
              // 표 렌더링 대폭 개선
              table: ({ children, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-lg border">
                  <table 
                    className="min-w-full divide-y"
                    style={{
                      borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
                    }}
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children, ...props }) => (
                <thead 
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb'
                  }}
                  {...props}
                >
                  {children}
                </thead>
              ),
              th: ({ children, ...props }) => (
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: isDarkMode ? '#d1d5db' : '#6b7280'
                  }}
                  {...props}
                >
                  {children}
                </th>
              ),
              tbody: ({ children, ...props }) => (
                <tbody 
                  className="divide-y"
                  style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                  }}
                  {...props}
                >
                  {children}
                </tbody>
              ),
              td: ({ children, ...props }) => (
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{
                    color: isDarkMode ? '#e5e7eb' : '#111827'
                  }}
                  {...props}
                >
                  {children}
                </td>
              ),
              
              // 인용문 스타일 대폭 개선
              blockquote: ({ children, ...props }) => (
                <blockquote 
                  className="border-l-4 pl-6 pr-4 py-4 my-6 italic relative"
                  style={{
                    borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                    backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe'
                  }}
                  {...props}
                >
                  <div 
                    className="absolute top-2 left-2 text-2xl font-bold"
                    style={{
                      color: isDarkMode ? '#60a5fa' : '#3b82f6'
                    }}
                  >
                    &quot;
                  </div>
                  <div 
                    className="ml-4"
                    style={{
                      color: isDarkMode ? '#d1d5db' : '#4b5563'
                    }}
                  >
                    {children}
                  </div>
                </blockquote>
              ),
              
              // 링크 개선
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  className="underline underline-offset-2 hover:underline-offset-4 transition-all"
                  style={{
                    color: isDarkMode ? '#60a5fa' : '#2563eb'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
              
              // 수평선 개선
              hr: ({ ...props }) => (
                <hr 
                  className="my-8 border-t-2" 
                  style={{
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                  }}
                  {...props} 
                />
              ),
              
              // 문단 개선
              p: ({ children, ...props }) => (
                <p 
                  className="mb-4 leading-relaxed" 
                  style={{
                    color: isDarkMode ? '#e5e7eb' : '#374151'
                  }}
                  {...props}
                >
                  {children}
                </p>
              ),
              
              // 강조 텍스트 개선
              strong: ({ children, ...props }) => (
                <strong 
                  style={{
                    color: isDarkMode ? '#f9fafb' : '#111827'
                  }}
                  {...props}
                >
                  {children}
                </strong>
              ),
              
              // 이탤릭 텍스트 개선
              em: ({ children, ...props }) => (
                <em 
                  style={{
                    color: isDarkMode ? '#d1d5db' : '#4b5563'
                  }}
                  {...props}
                >
                  {children}
                </em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}