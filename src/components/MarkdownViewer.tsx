'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { useStore, getActiveFile } from '@/store/useStore';

import { useState, useEffect, useRef, type ComponentProps } from 'react';

type CodeProps = ComponentProps<'code'> & { inline?: boolean };

// CSS variable references for theme-aware inline styles
const v = {
  bg: 'var(--canvas-bg)',
  bgSubtle: 'var(--canvas-subtle)',
  text: 'var(--canvas-text)',
  textMuted: 'var(--canvas-text-muted)',
  border: 'var(--canvas-border)',
  link: 'var(--canvas-link)',
};

export default function MarkdownViewer() {
  const activeFile = useStore(getActiveFile);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const prevFileId = useRef<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const content = activeFile?.content || '';

  // Save/restore scroll position per tab
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    // Save previous tab's scroll position
    if (prevFileId.current && prevFileId.current !== activeFile?.id) {
      scrollPositions.current[prevFileId.current] = preview.scrollTop;
    }

    // Restore current tab's scroll position (or reset to top)
    preview.scrollTop = activeFile?.id ? (scrollPositions.current[activeFile.id] ?? 0) : 0;
    prevFileId.current = activeFile?.id ?? null;
  }, [activeFile?.id]);

  useEffect(() => {
    const handleEditorScroll = (e: CustomEvent) => {
      if (!previewRef.current || !activeFile) return;
      if (e.detail.fileId !== activeFile.id) return;
      const { scrollPercentage } = e.detail;
      const preview = previewRef.current;
      preview.scrollTop = scrollPercentage * ((preview.scrollHeight - preview.clientHeight) || 1);
    };
    window.addEventListener('editor-scroll', handleEditorScroll as EventListener);
    return () => window.removeEventListener('editor-scroll', handleEditorScroll as EventListener);
  }, [activeFile]);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!activeFile) return;
    const preview = e.currentTarget;
    const scrollPercentage = preview.scrollTop / ((preview.scrollHeight - preview.clientHeight) || 1);
    window.dispatchEvent(new CustomEvent('preview-scroll', { detail: { scrollPercentage, fileId: activeFile.id } }));
  };

  return (
    <div className="h-full flex flex-col">
      <div
        ref={previewRef}
        className="gh-preview flex-1 overflow-y-auto"
        onScroll={handlePreviewScroll}
      >
        <div className="gh-preview-content prose p-6 mx-auto prose-headings:scroll-mt-16 text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkEmoji, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
            components={{
              li: ({ children, className, ...props }) => {
                const stringChildren = children?.toString() || '';
                if (stringChildren.includes('type="checkbox"')) {
                  return <li className="flex items-start gap-2 list-none ml-0" {...props}>{children}</li>;
                }
                return <li className={`${className || ''} leading-relaxed`} {...props}>{children}</li>;
              },

              input: ({ type, checked, ...props }) => {
                if (type === 'checkbox') {
                  return (
                    <input type="checkbox" checked={checked} readOnly className="gh-checkbox mr-2" {...props} />
                  );
                }
                return <input type={type} checked={checked} {...props} />;
              },

              h1: ({ children, ...props }) => (
                <h1 className="text-2xl font-bold mb-4 pb-2 border-b" style={{ color: v.text, borderColor: v.border }} {...props}>{children}</h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="text-xl font-semibold mb-3 mt-6 pb-1 border-b" style={{ color: v.text, borderColor: v.border }} {...props}>{children}</h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="text-lg font-semibold mb-2 mt-4" style={{ color: v.text }} {...props}>{children}</h3>
              ),

              ol: ({ children, ...props }) => (
                <ol className="mb-4" style={{ color: v.text }} {...props}>{children}</ol>
              ),
              ul: ({ children, ...props }) => (
                <ul className="mb-4" style={{ color: v.text }} {...props}>{children}</ul>
              ),

              code: ({ inline, className, children }: CodeProps) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative my-6">
                    <div className="gh-code-header rounded-t-md px-4 py-2 text-xs font-medium uppercase tracking-wider border-b">
                      {match[1]}
                    </div>
                    <pre className="gh-code-block !rounded-t-none !rounded-b-md overflow-x-auto !m-0 !p-4 border border-t-0">
                      <code className={`${className} !bg-transparent !text-inherit`}>{children}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        const text = String(children);
                        navigator.clipboard.writeText(text);
                        setCopiedBlock(text);
                        setTimeout(() => setCopiedBlock(null), 2000);
                      }}
                      className="gh-btn-secondary absolute top-8 right-2 !px-2 !py-0.5 text-xs"
                      title="Copy code"
                    >
                      {copiedBlock === String(children) ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <code className="gh-inline-code px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                );
              },

              table: ({ children, ...props }) => (
                <div className="overflow-x-auto my-4" >
                  <table className="gh-table" {...props}>{children}</table>
                </div>
              ),
              thead: ({ children, ...props }) => (
                <thead className="gh-table-head" {...props}>{children}</thead>
              ),
              th: ({ children, ...props }) => (
                <th className="gh-table-th" {...props}>{children}</th>
              ),
              tbody: ({ children, ...props }) => (
                <tbody className="gh-table-body" {...props}>{children}</tbody>
              ),
              td: ({ children, ...props }) => (
                <td className="gh-table-td" {...props}>{children}</td>
              ),

              blockquote: ({ children, ...props }) => (
                <blockquote className="border-l-4 pl-4 my-4" style={{ borderColor: v.border, color: v.textMuted }} {...props}>{children}</blockquote>
              ),

              a: ({ children, href, ...props }) => (
                <a href={href} className="underline underline-offset-2 hover:underline-offset-4 transition-all" style={{ color: v.link }} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
              ),

              hr: ({ ...props }) => (
                <hr className="my-6 border-t" style={{ borderColor: v.border }} {...props} />
              ),

              p: ({ children, ...props }) => (
                <p className="mb-4 leading-relaxed" style={{ color: v.text }} {...props}>{children}</p>
              ),

              strong: ({ children, ...props }) => (
                <strong style={{ color: v.text }} {...props}>{children}</strong>
              ),
              em: ({ children, ...props }) => (
                <em style={{ color: v.text }} {...props}>{children}</em>
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
