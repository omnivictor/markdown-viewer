import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const DEFAULT_CONTENT = `# Markdown Editor

A simple, real-time markdown editor with live preview.

## Text Formatting

**Bold**, *Italic*, ~~Strikethrough~~, \`inline code\`

## Links & Images

[GitHub](https://github.com) | [Example](https://example.com)

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Name | Type | Description |
|------|------|-------------|
| Markdown | Format | Lightweight markup language |
| Preview | Feature | Real-time rendering |
| Dark Mode | Feature | Eye-friendly theme |

## Task List

- [x] Markdown parsing
- [x] Live preview
- [x] Dark mode
- [ ] Your next idea

## Blockquote

> The best way to predict the future is to create it.

---

*Start editing to see your changes in real time.*`;

export function validateMarkdownFile(file: File): boolean {
  const validTypes = ['text/markdown', 'text/plain', 'application/octet-stream'];
  const validExtensions = ['.md', '.markdown', '.txt'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
}