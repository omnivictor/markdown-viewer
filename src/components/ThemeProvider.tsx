'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useStore();

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove('dark', 'light');
    html.classList.add(isDarkMode ? 'dark' : 'light');
    html.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  return <>{children}</>;
}
