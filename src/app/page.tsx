'use client';

import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeProvider from '@/components/ThemeProvider';

export default function Home() {
  const { error, isDarkMode } = useStore();

  return (
    <ThemeProvider>
      <div 
        className="h-screen flex flex-col transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#171717'
        }}
      >
        <Header />
        
        {error && (
          <div className={`mx-4 mt-4 p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <main className="flex-1 flex min-h-0">
          {/* Left Panel - Editor */}
          <div 
            className="w-1/2 border-r transition-colors duration-300"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb'
            }}
          >
            <MarkdownEditor />
          </div>
          
          {/* Right Panel - Preview */}
          <div 
            className="w-1/2 transition-colors duration-300"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
            }}
          >
            <MarkdownViewer />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
