import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri || '';
export const IP = debuggerHost.split(':').shift() || 'localhost';