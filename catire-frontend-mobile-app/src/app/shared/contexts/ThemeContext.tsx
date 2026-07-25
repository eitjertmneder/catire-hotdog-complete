import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/theme';

type ThemeColors = typeof lightTheme.colors;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightTheme.colors,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

const THEME_KEY = 'app-dark-mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value === 'true') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    AsyncStorage.setItem(THEME_KEY, String(newValue));
  };

  const setDarkMode = (value: boolean) => {
    setIsDark(value);
    AsyncStorage.setItem(THEME_KEY, String(value));
  };

  const colors = isDark ? darkTheme.colors : lightTheme.colors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
