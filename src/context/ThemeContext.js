import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dark colors = tumhare current app ke exact colors
export const darkColors = {
  bg: '#070E20',
  card: '#0D162C',
  border: '#202D49',
  headerBorder: '#131D35',
  badgeBg: '#101A31',
  text: '#FFFFFF',
  label: '#D9DDE7',
  muted: '#7E879B',
  icon: '#8D96AA',
  primary: '#FF7622',
  success: '#35D49B',
  danger: '#FF526A',
  switchOff: '#202D49',
};

export const lightColors = {
  bg: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  headerBorder: '#E2E8F0',
  badgeBg: '#FFF3EA',
  text: '#0F172A',
  label: '#334155',
  muted: '#64748B',
  icon: '#64748B',
  primary: '#FF7622',
  success: '#16A34A',
  danger: '#E11D48',
  switchOff: '#CBD5E1',
};

const ThemeContext = createContext({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'app_theme';

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  // App khulne par saved theme load karo
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setIsDark(saved === 'dark');
      } catch (e) {
        console.log('Theme load error', e);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch (e) {
      console.log('Theme save error', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);