import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const getOrCreateDeviceId = async (): Promise<string> => {
  let deviceId = await SecureStore.getItemAsync('deviceId');
  if (!deviceId) {
    // Attempt to use a consistent hardware ID if possible, fallback to UUID
    deviceId = Device.osInternalBuildId || uuidv4();
    await SecureStore.setItemAsync('deviceId', deviceId);
  }
  return deviceId;
};

export const getDeviceFingerprint = () => {
  return {
    brand: Device.brand,
    model: Device.modelName,
    os: Device.osName,
    osVersion: Device.osVersion,
    isDevice: Device.isDevice,
  };
};

export const getDevicePayload = async () => {
  const deviceId = await getOrCreateDeviceId();
  const fingerprint = getDeviceFingerprint();
  return {
    deviceId,
    deviceFingerprint: JSON.stringify(fingerprint),
    platform: Device.osName || 'Unknown',
  };
};
