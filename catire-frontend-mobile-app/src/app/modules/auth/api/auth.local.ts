import * as LocalAuthentication from 'expo-local-authentication';

const checkBiometricsAvailability = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

const authenticate = async (): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Usa tu huella para acceder',
    fallbackLabel: 'Usar contraseña',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });
  return result.success;
}

export {
  checkBiometricsAvailability, authenticate
}