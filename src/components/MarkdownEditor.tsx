'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore, getActiveFile } from '@/store/useStore';
import { generateId } from '@/lib/utils';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// GitHub Dark theme for CodeMirror
const ghDarkTheme = EditorView.theme({
  '&': { backgroundColor: 'var(--canvas-bg)', color: 'var(--canvas-text)', fontSize: '13px' },
  '.cm-content': { caretColor: 'var(--canvas-text)', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' },
  '.cm-cursor': { borderLeftColor: 'var(--canvas-text)' },
  '.cm-activeLine': { backgroundColor: 'rgba(110,118,129,0.1)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(110,118,129,0.1)' },
  '.cm-gutters': { backgroundColor: 'var(--canvas-bg)', color: 'var(--canvas-text-muted)', border: 'none', borderRight: '1px solid var(--canvas-border)' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 0.5rem 0 0.75rem', minWidth: '2.5rem' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(88,166,255,0.3)' },
  '.cm-panels': { backgroundColor: 'var(--canvas-subtle)', color: 'var(--canvas-text)' },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--canvas-border)' },
  '.cm-searchMatch': { backgroundColor: 'rgba(210,153,34,0.4)', outline: '1px solid rgba(210,153,34,0.6)' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'rgba(88,166,255,0.4)' },
  '.cm-panel.cm-search input': { backgroundColor: 'var(--canvas-bg)', color: 'var(--canvas-text)', border: '1px solid var(--canvas-border)', borderRadius: '3px', padding: '2px 6px', fontSize: '13px' },
  '.cm-panel.cm-search button': { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--canvas-border)', borderRadius: '3px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
  '.cm-panel.cm-search label': { color: 'var(--canvas-text-muted)', fontSize: '12px' },
  '.cm-tooltip': { backgroundColor: 'var(--canvas-subtle)', border: '1px solid var(--canvas-border)' },
}, { dark: true });

const ghHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.5em', color: '#e6edf3' },
  { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.3em', color: '#e6edf3' },
  { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.1em', color: '#e6edf3' },
  { tag: tags.strong, fontWeight: 'bold', color: '#e6edf3' },
  { tag: tags.emphasis, fontStyle: 'italic', color: '#e6edf3' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#8b949e' },
  { tag: tags.link, color: '#58a6ff', textDecoration: 'underline' },
  { tag: tags.url, color: '#58a6ff' },
  { tag: tags.monospace, color: '#79c0ff', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { tag: tags.quote, color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#ff7b72' },
  { tag: tags.string, color: '#a5d6ff' },
  { tag: tags.comment, color: '#8b949e' },
  { tag: tags.processingInstruction, color: '#8b949e' },
  { tag: tags.meta, color: '#8b949e' },
]);

const themeCompartment = new Compartment();

export default function MarkdownEditor() {
  const { openFile, updateFileContent } = useStore();
  const activeFile = useStore(getActiveFile);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

  const content = activeFile?.content ?? '';

  const handleChange = useCallback((update: { state: EditorState; docChanged: boolean }) => {
    if (!update.docChanged || isExternalUpdate.current) return;
    const newContent = update.state.doc.toString();
    if (activeFile) {
      updateFileContent(activeFile.id, newContent);
    } else {
      openFile({
        id: generateId(),
        name: 'untitled.md',
        content: newContent,
        size: newContent.length,
        lastModified: Date.now(),
      });
    }
  }, [activeFile, updateFileContent, openFile]);

  // Create editor
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        highlightSelectionMatches(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        themeCompartment.of([ghDarkTheme, syntaxHighlighting(ghHighlightStyle)]),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => handleChange(update)),
        EditorView.lineWrapping,
      ],
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync content from store to editor when switching tabs
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== content) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
      });
      isExternalUpdate.current = false;
    }
  }, [content]);

  // Scroll sync: editor → preview
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const handleScroll = () => {
      const scrollInfo = view.scrollDOM;
      const scrollPercentage = scrollInfo.scrollTop / ((scrollInfo.scrollHeight - scrollInfo.clientHeight) || 1);
      window.dispatchEvent(new CustomEvent('editor-scroll', { detail: { scrollPercentage } }));
    };

    view.scrollDOM.addEventListener('scroll', handleScroll);
    return () => view.scrollDOM.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll sync: preview → editor
  useEffect(() => {
    const handlePreviewScroll = (e: CustomEvent) => {
      const view = viewRef.current;
      if (!view) return;
      const { scrollPercentage } = e.detail;
      const scrollDOM = view.scrollDOM;
      scrollDOM.scrollTop = scrollPercentage * ((scrollDOM.scrollHeight - scrollDOM.clientHeight) || 1);
    };
    window.addEventListener('preview-scroll', handlePreviewScroll as EventListener);
    return () => window.removeEventListener('preview-scroll', handlePreviewScroll as EventListener);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div ref={editorRef} className="gh-codemirror flex-1 min-h-0" />
    </div>
  );
}
