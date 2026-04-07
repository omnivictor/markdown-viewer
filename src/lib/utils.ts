export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function generateId(): string {
  return crypto.randomUUID();
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


export async function saveFile(content: string, filename: string, mimeType: string): Promise<void> {
  try {
    if ('showSaveFilePicker' in window) {
      const ext = filename.split('.').pop() || '';
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: `${ext.toUpperCase()} files`, accept: { [mimeType]: [`.${ext}`] } }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
  }
  // Fallback: anchor download
  const blob = new Blob([content], { type: `${mimeType}; charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateMarkdownFile(file: File): boolean {
  const validTypes = ['text/markdown', 'text/plain', 'application/octet-stream'];
  const validExtensions = ['.md', '.markdown', '.txt'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
}