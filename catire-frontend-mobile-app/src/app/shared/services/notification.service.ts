import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Detect if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export class NotificationService {
  // Request permission and get push token
  static async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Notificaciones push requieren dispositivo fisico');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones denegado');
      return null;
    }

    // In Expo Go, FCM no esta disponible - usar notificaciones locales
    if (isExpoGo) {
      console.log('Expo Go detectado - notificaciones locales activas (FCM requiere dev-client APK)');
      return null;
    }

    // In dev-client or standalone app, get FCM push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'befbd6e8-1ce1-41f0-9e4c-875d57dd23ea',
      });
      console.log('FCM Push token:', tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.log('FCM no disponible, usando notificaciones locales');
      return null;
    }
  }

  // Schedule a local notification (works everywhere - Expo Go + Dev Client)
  static async sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // immediate
    });
  }

  // Listen for incoming notifications
  static addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Listen for notification tap (when user taps on notification)
  static addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Remove all listeners
  static removeAllListeners(subscriptions: Notifications.Subscription[]) {
    subscriptions.forEach(sub => sub.remove());
  }
}
