/**
 * ThemeContext.jsx
 * Manages dark/light mode and accent color.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { settingsStorage } from '../services/storageService';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => settingsStorage.getTheme());
  const [accent, setAccentState] = useState(() => settingsStorage.getAccent());

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    settingsStorage.setTheme(theme);
  }, [theme]);

  // Apply accent data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    settingsStorage.setAccent(accent);
  }, [accent]);

  const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (t) => setThemeState(t);
  const setAccent = (a) => setAccentState(a);

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
