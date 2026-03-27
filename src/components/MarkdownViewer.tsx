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

  // GitHub Dark Default color tokens
  const c = isDarkMode ? {
    bg: '#0d1117',
    bgSubtle: '#161b22',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    link: '#58a6ff',
    codeBg: '#161b22',
    codeBorder: '#30363d',
    blockquoteBorder: '#30363d',
    blockquoteBg: 'transparent',
  } : {
    bg: '#ffffff',
    bgSubtle: '#f6f8fa',
    text: '#1f2328',
    textMuted: '#57606a',
    border: '#d0d7de',
    link: '#0969da',
    codeBg: '#f6f8fa',
    codeBorder: '#d0d7de',
    blockquoteBorder: '#d0d7de',
    blockquoteBg: 'transparent',
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between p-4 border-b transition-colors duration-300"
        style={{
          backgroundColor: c.bgSubtle,
          borderColor: c.border,
          color: c.text
        }}
      >
        <h2 className="text-lg font-semibold">
          Preview
        </h2>
      </div>

      <div
        ref={previewRef}
        className="flex-1 overflow-y-auto transition-colors duration-300"
        style={{ backgroundColor: c.bg }}
        onScroll={handlePreviewScroll}
      >
        <div
          className="prose max-w-none p-6 prose-headings:scroll-mt-16 transition-colors duration-300"
          style={{
            backgroundColor: c.bg,
            color: c.text,
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkEmoji, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
            components={{
              li: ({ children, className, ...props }) => {
                const stringChildren = children?.toString() || '';
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

              input: ({ type, checked, ...props }) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2"
                      style={{
                        accentColor: c.textMuted,
                        transform: 'scale(1.1)',
                        verticalAlign: 'middle'
                      }}
                      {...props}
                    />
                  );
                }
                return <input type={type} checked={checked} {...props} />;
              },

              h1: ({ children, ...props }) => (
                <h1
                  className="text-2xl font-bold mb-4 pb-2 border-b"
                  style={{ color: c.text, borderColor: c.border }}
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-xl font-semibold mb-3 mt-6 pb-1 border-b"
                  style={{ color: c.text, borderColor: c.border }}
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-lg font-semibold mb-2 mt-4"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </h3>
              ),

              ol: ({ children, ...props }) => (
                <ol
                  className="list-decimal list-inside space-y-2 mb-4 pl-6"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </ol>
              ),

              ul: ({ children, ...props }) => (
                <ul
                  className="space-y-2 mb-4 pl-6"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </ul>
              ),

              code: ({ inline, className, children }: CodeProps) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative my-6">
                    <div
                      className="rounded-t-md px-4 py-2 text-xs font-medium uppercase tracking-wider border-b"
                      style={{
                        backgroundColor: c.bgSubtle,
                        borderColor: c.codeBorder,
                        color: c.textMuted
                      }}
                    >
                      {match[1]}
                    </div>
                    <pre
                      className="!rounded-t-none !rounded-b-md overflow-x-auto !m-0 !p-4 border border-t-0"
                      style={{
                        backgroundColor: c.codeBg,
                        borderColor: c.codeBorder,
                        color: c.text
                      }}
                    >
                      <code className={`${className} !bg-transparent !text-inherit`}>
                        {children}
                      </code>
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="absolute top-8 right-2 px-3 py-1 text-xs rounded transition-colors"
                      style={{
                        backgroundColor: isDarkMode ? '#21262d' : '#e1e4e8',
                        color: c.textMuted,
                        border: `1px solid ${c.border}`
                      }}
                      title="Copy code"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <code
                    className="px-1.5 py-0.5 rounded text-sm font-mono"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(110,118,129,0.4)' : 'rgba(175,184,193,0.2)',
                      color: c.text
                    }}
                  >
                    {children}
                  </code>
                );
              },

              table: ({ children, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-md border" style={{ borderColor: c.border }}>
                  <table
                    className="min-w-full divide-y"
                    style={{ borderColor: c.border, backgroundColor: c.bg }}
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children, ...props }) => (
                <thead style={{ backgroundColor: c.bgSubtle }} {...props}>
                  {children}
                </thead>
              ),
              th: ({ children, ...props }) => (
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </th>
              ),
              tbody: ({ children, ...props }) => (
                <tbody
                  className="divide-y"
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  {...props}
                >
                  {children}
                </tbody>
              ),
              td: ({ children, ...props }) => (
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </td>
              ),

              blockquote: ({ children, ...props }) => (
                <blockquote
                  className="border-l-4 pl-4 my-4"
                  style={{
                    borderColor: c.blockquoteBorder,
                    color: c.textMuted
                  }}
                  {...props}
                >
                  {children}
                </blockquote>
              ),

              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  className="underline underline-offset-2 hover:underline-offset-4 transition-all"
                  style={{ color: c.link }}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),

              hr: ({ ...props }) => (
                <hr
                  className="my-6 border-t"
                  style={{ borderColor: c.border }}
                  {...props}
                />
              ),

              p: ({ children, ...props }) => (
                <p
                  className="mb-4 leading-relaxed"
                  style={{ color: c.text }}
                  {...props}
                >
                  {children}
                </p>
              ),

              strong: ({ children, ...props }) => (
                <strong style={{ color: c.text }} {...props}>
                  {children}
                </strong>
              ),

              em: ({ children, ...props }) => (
                <em style={{ color: c.text }} {...props}>
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
