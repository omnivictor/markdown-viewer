'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function TabBar() {
  const { files, activeFileId, closeFile, setActiveFile, reorderFiles } = useStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image slightly transparent
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

        return (
          <div
            key={file.id}
            className={`gh-tab group ${isActive ? 'gh-tab-active' : ''}`}
            style={{
              opacity: isDragged ? 0.4 : 1,
              borderLeftWidth: isDropTarget && dragIndex !== null && dragIndex > index ? '2px' : undefined,
              borderRightWidth: isDropTarget && dragIndex !== null && dragIndex < index ? '2px' : undefined,
              borderLeftColor: isDropTarget && dragIndex !== null && dragIndex > index ? 'var(--tab-active-border)' : undefined,
              borderRightColor: isDropTarget && dragIndex !== null && dragIndex < index ? 'var(--tab-active-border)' : undefined,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="max-w-[140px] truncate select-none">{file.name}</span>
            <button
              type="button"
              className="gh-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              title="Close"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
