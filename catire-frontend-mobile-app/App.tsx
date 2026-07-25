import React from 'react';
import AppQueryProvider from './src/app/shared/providers/QueryProvider';
import { ThemeProvider } from './src/app/shared/contexts/ThemeContext';
import MainNavigator from './src/app/navigation/MainNavigator';

export default function App() {
  return (
    <AppQueryProvider>
      <ThemeProvider>
        <MainNavigator />
      </ThemeProvider>
    </AppQueryProvider>
  );
}
