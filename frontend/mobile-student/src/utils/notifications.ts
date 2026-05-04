import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  // Remote notifications are NOT supported in Expo Go on SDK 53+
  if (Constants.appOwnership === 'expo') {
    console.log('Remote notifications are currently disabled in Expo Go. Use a development build for full FCM support.');
    return null;
  }

  const Notifications: any = require('expo-notifications');
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Project ID is needed for Expo Go
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    try {
      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('FCM Device Token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
