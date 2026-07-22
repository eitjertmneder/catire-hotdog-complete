import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      isDark: false,

      setMode: (mode) => {
        const isDark = mode === 'dark';
        set({ mode, isDark });
      },

      toggleTheme: () => {
        const { isDark } = get();
        set({ isDark: !isDark, mode: !isDark ? 'dark' : 'light' });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Theme colors
export const lightTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  primary: '#D32F2F',
  primaryLight: '#FFCDD2',
  secondary: '#1976D2',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  card: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.06)',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',
  primary: '#FF5252',
  primaryLight: '#4A2020',
  secondary: '#64B5F6',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  border: '#333333',
  borderLight: '#2A2A2A',
  card: '#1E1E1E',
  shadow: 'rgba(0,0,0,0.3)',
};
