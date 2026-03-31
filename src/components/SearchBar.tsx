'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore, getActiveFile } from '@/store/useStore';

export default function SearchBar({ onClose }: { onClose: () => void }) {
  const { updateFileContent } = useStore();
  const activeFile = useStore(getActiveFile);
  const [query, setQuery] = useState('');
  const [replace, setReplace] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query || !activeFile) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = activeFile.content.match(regex);
    setMatchCount(matches?.length || 0);
    setCurrentMatch(matches?.length ? 1 : 0);
  }, [query, activeFile]);

  const handleReplace = useCallback(() => {
    if (!activeFile || !query || matchCount === 0) return;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const newContent = activeFile.content.replace(regex, replace);
    updateFileContent(activeFile.id, newContent);
  }, [activeFile, query, replace, matchCount, updateFileContent]);

  const handleReplaceAll = useCallback(() => {
    if (!activeFile || !query || matchCount === 0) return;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newContent = activeFile.content.replace(regex, replace);
    updateFileContent(activeFile.id, newContent);
  }, [activeFile, query, replace, matchCount, updateFileContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey && showReplace) handleReplaceAll();
  };

  return (
    <div className="gh-search-bar" onKeyDown={handleKeyDown}>
      <div className="gh-search-row">
        <input
          ref={searchRef}
          className="gh-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          title="Search"
        />
        <span className="gh-search-count">
          {query ? `${currentMatch}/${matchCount}` : ''}
        </span>
        <button
          type="button"
          className="gh-toolbar-btn"
          title="Toggle Replace"
          onClick={() => setShowReplace(!showReplace)}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <button type="button" className="gh-toolbar-btn" title="Close (Esc)" onClick={onClose}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showReplace && (
        <div className="gh-search-row">
          <input
            className="gh-search-input"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replace..."
            title="Replace"
          />
          <button type="button" className="gh-toolbar-btn" title="Replace" onClick={handleReplace}>
            1
          </button>
          <button type="button" className="gh-toolbar-btn" title="Replace All (Ctrl+Enter)" onClick={handleReplaceAll}>
            *
          </button>
        </div>
      )}
    </div>
  );
}
