'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useStore();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Disable transitions during theme switch to prevent partial updates
    html.style.setProperty('--transition-override', 'none');
    document.querySelectorAll('[style*="transition"], [class*="transition"]').forEach(el => {
      (el as HTMLElement).style.transition = 'none';
    });

    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');

    const bg = isDarkMode ? '#0d1117' : '#ffffff';
    const fg = isDarkMode ? '#e6edf3' : '#1f2328';

    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.add('light');
      body.classList.add('light');
    }
    html.style.colorScheme = isDarkMode ? 'dark' : 'light';

    // Apply to all root elements
    [html, body, document.getElementById('__next'), document.getElementById('root')]
      .filter(Boolean)
      .forEach(el => {
        (el as HTMLElement).style.backgroundColor = bg;
        (el as HTMLElement).style.color = fg;
      });

    body.style.setProperty('background-color', bg, 'important');
    body.style.setProperty('color', fg, 'important');

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('[style*="transition: none"]').forEach(el => {
          (el as HTMLElement).style.transition = '';
        });
        html.style.removeProperty('--transition-override');
      });
    });
  }, [isDarkMode]);

  return <>{children}</>;
}
