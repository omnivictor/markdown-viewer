'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useStore();

  useEffect(() => {
    console.log('ThemeProvider: isDarkMode changed to', isDarkMode); // 디버깅
    
    const html = document.documentElement;
    const body = document.body;
    
    // 모든 다크 관련 클래스 제거
    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    // 모든 가능한 루트 요소들을 찾아서 배경색 적용
    const rootElements = [
      document.getElementById('__next'),
      document.getElementById('root'),
      document.querySelector('[data-reactroot]'),
      body,
      html
    ].filter(Boolean);
    
    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      html.style.colorScheme = 'dark';
      
      // 강제로 모든 루트 요소에 다크 스타일 적용
      rootElements.forEach(element => {
        if (element) {
          (element as HTMLElement).style.backgroundColor = '#111827';
          (element as HTMLElement).style.color = '#f9fafb';
        }
      });
      
      // 페이지 전체에 다크 클래스 추가
      body.style.setProperty('background-color', '#111827', 'important');
      body.style.setProperty('color', '#f9fafb', 'important');
      
      console.log('Applied dark mode'); // 디버깅
    } else {
      html.classList.add('light');
      body.classList.add('light');
      html.style.colorScheme = 'light';
      
      // 강제로 모든 루트 요소에 라이트 스타일 적용
      rootElements.forEach(element => {
        if (element) {
          (element as HTMLElement).style.backgroundColor = '#ffffff';
          (element as HTMLElement).style.color = '#171717';
        }
      });
      
      // 페이지 전체에 라이트 클래스 추가
      body.style.setProperty('background-color', '#ffffff', 'important');
      body.style.setProperty('color', '#171717', 'important');
      
      console.log('Applied light mode'); // 디버깅
    }
    
    // 강제로 페이지 전체 리렌더링 트리거
    html.style.display = 'none';
    setTimeout(() => {
      html.style.display = '';
    }, 1);
    
  }, [isDarkMode]);

  return <>{children}</>;
}