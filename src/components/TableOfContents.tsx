'use client';

import { useState, useEffect } from 'react';
import { useStore, getActiveFile } from '@/store/useStore';


interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const activeFile = useStore(getActiveFile);
  const [items, setItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const content = activeFile?.content || '';

  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const tocItems: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~]/g, '').trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      tocItems.push({ id, text, level });
    }

    setItems(tocItems);
  }, [content]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="gh-toc">
      <button
        type="button"
        className="gh-toc-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Contents</span>
      </button>

      {isOpen && (
        <nav className="gh-toc-nav">
          {items.map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              type="button"
              className="gh-toc-item"
              style={{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }}
              onClick={() => handleClick(item.id)}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
