import React from 'react';
import { ThemeProvider } from './src/app/shared/contexts/ThemeContext';
import MainNavigator from './src/app/navigation/MainNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
}
