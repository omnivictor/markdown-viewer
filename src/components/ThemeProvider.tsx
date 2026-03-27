'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useStore();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');

    const rootElements = [
      document.getElementById('__next'),
      document.getElementById('root'),
      body,
      html
    ].filter(Boolean);

    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      html.style.colorScheme = 'dark';

      rootElements.forEach(el => {
        if (el) {
          (el as HTMLElement).style.backgroundColor = '#0d1117';
          (el as HTMLElement).style.color = '#e6edf3';
        }
      });
      body.style.setProperty('background-color', '#0d1117', 'important');
      body.style.setProperty('color', '#e6edf3', 'important');
    } else {
      html.classList.add('light');
      body.classList.add('light');
      html.style.colorScheme = 'light';

      rootElements.forEach(el => {
        if (el) {
          (el as HTMLElement).style.backgroundColor = '#ffffff';
          (el as HTMLElement).style.color = '#1f2328';
        }
      });
      body.style.setProperty('background-color', '#ffffff', 'important');
      body.style.setProperty('color', '#1f2328', 'important');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
