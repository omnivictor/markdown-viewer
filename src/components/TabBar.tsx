'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function TabBar() {
  const { files, activeFileId, closeFile, setActiveFile, reorderFiles, renameFile } = useStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  if (files.length === 0) return null;

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleRenameConfirm = () => {
    if (editingId && editingName.trim()) {
      renameFile(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameConfirm();
    if (e.key === 'Escape') setEditingId(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && index !== dragIndex) {
      setDropIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorderFiles(dragIndex, index);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="gh-tab-bar flex items-end overflow-x-auto">
      {files.map((file, index) => {
        const isActive = file.id === activeFileId;
        const isDragged = dragIndex === index;
        const isDropTarget = dropIndex === index;
        const isEditing = editingId === file.id;

        return (
          <div
            key={file.id}
            className={`gh-tab group ${isActive ? 'gh-tab-active' : ''}`}
            style={{
              opacity: isDragged ? 0.4 : 1,
              boxShadow: isDropTarget && dragIndex !== null
                ? (dragIndex > index ? 'inset 3px 0 0 var(--tab-active-border)' : 'inset -3px 0 0 var(--tab-active-border)')
                : undefined,
            }}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => !isEditing && setActiveFile(file.id)}
            onDoubleClick={() => handleDoubleClick(file.id, file.name)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className="gh-tab-rename"
                title="Rename file"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="max-w-[140px] truncate select-none">{file.name}</span>
                {file.isDirty && <span className="gh-tab-dirty">●</span>}
              </>
            )}
            {!isEditing && (
              <button
                type="button"
                className="gh-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  if (file.isDirty && !window.confirm(`"${file.name}" has unsaved changes. Close anyway?`)) return;
                  closeFile(file.id);
                }}
                title="Close"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
