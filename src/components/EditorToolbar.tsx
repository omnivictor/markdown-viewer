'use client';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (content: string) => void;
}

type FormatAction = { prefix: string; suffix: string; placeholder: string };

const FORMAT_ACTIONS: Record<string, FormatAction> = {
  bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
  italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
  code: { prefix: '`', suffix: '`', placeholder: 'code' },
  link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
  heading: { prefix: '### ', suffix: '', placeholder: 'heading' },
  quote: { prefix: '> ', suffix: '', placeholder: 'quote' },
};

export default function EditorToolbar({ textareaRef, onContentChange }: EditorToolbarProps) {
  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = selected
      ? `${action.prefix}${selected}${action.suffix}`
      : `${action.prefix}${action.placeholder}${action.suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    onContentChange(newText);

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        const cursorPos = start + action.prefix.length;
        textarea.setSelectionRange(cursorPos, cursorPos + action.placeholder.length);
      }
    });
  };

  const buttons = [
    { key: 'bold', label: 'B', title: 'Bold (Ctrl+B)', className: 'font-bold' },
    { key: 'italic', label: 'I', title: 'Italic (Ctrl+I)', className: 'italic' },
    { key: 'code', label: '<>', title: 'Inline code', className: 'font-mono text-xs' },
    { key: 'link', label: '🔗', title: 'Link', className: '' },
    { key: 'heading', label: 'H', title: 'Heading', className: 'font-bold' },
    { key: 'quote', label: '❝', title: 'Blockquote', className: '' },
  ];

  return (
    <div className="gh-editor-toolbar">
      {buttons.map(btn => (
        <button
          key={btn.key}
          type="button"
          className={`gh-toolbar-btn ${btn.className}`}
          title={btn.title}
          onClick={() => applyFormat(FORMAT_ACTIONS[btn.key])}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
