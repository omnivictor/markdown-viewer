export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
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