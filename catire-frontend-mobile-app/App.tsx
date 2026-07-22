import React from 'react';
import AppQueryProvider from './src/app/shared/providers/QueryProvider';
import MainNavigator from './src/app/navigation/MainNavigator';

export default function App() {
  return (
    <AppQueryProvider>
      <MainNavigator />
    </AppQueryProvider>
  );
}
