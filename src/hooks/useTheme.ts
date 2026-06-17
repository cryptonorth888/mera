'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'auto';

function getSystemTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'auto';
  return (localStorage.getItem('theme') as Theme) || 'auto';
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') return getSystemTheme();
  return theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [effective, setEffective] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = getSavedTheme();
    setThemeState(saved);
    setEffective(getEffectiveTheme(saved));
  }, []);

  useEffect(() => {
    if (theme !== 'auto') return;

    const checkTime = () => {
      setEffective(getSystemTheme());
    };

    // Проверяем каждые 10 минут
    const interval = setInterval(checkTime, 10 * 60 * 1000);
    checkTime();

    return () => clearInterval(interval);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effective);
  }, [effective]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    setEffective(getEffectiveTheme(newTheme));
  }, []);

  return { theme, effective, setTheme };
}