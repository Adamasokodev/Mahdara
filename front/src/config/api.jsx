import { Platform } from 'react-native';
import * as Device from 'expo-device';

const PORT = 8000;

// Émulateur Android : l'adresse du PC est 10.0.2.2
// Téléphone réel branché en USB (avec adb reverse) : 127.0.0.1
const configuredHost = process.env.EXPO_PUBLIC_API_HOST;
const host = configuredHost || (
  Platform.OS === 'android' && !Device.isDevice
    ? '10.0.2.2'
    : '127.0.0.1'
);

export const API_URL = `http://${host}:${PORT}/api`;
