import { Platform } from 'react-native';

// Lazy load expo-local-authentication to avoid crash in Expo Go
let LocalAuthentication: any = null;

try {
  LocalAuthentication = require('expo-local-authentication');
} catch {
  // Module not available in Expo Go
}

const checkBiometricsAvailability = async (): Promise<boolean> => {
  if (!LocalAuthentication) {
    console.log('Biometric no disponible en Expo Go');
    return false;
  }
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

const authenticate = async (): Promise<boolean> => {
  if (!LocalAuthentication) {
    console.log('Biometric no disponible en Expo Go');
    return false;
  }
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Usa tu huella para acceder',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}

export {
  checkBiometricsAvailability, authenticate
}
