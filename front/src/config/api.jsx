import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const PORT = 8000;

// Émulateur Android : l'adresse du PC est 10.0.2.2
// Téléphone réel branché en USB (avec adb reverse) : 127.0.0.1
const configuredHost = process.env.EXPO_PUBLIC_API_HOST;
const metroHostUri = Constants.expoConfig?.hostUri;
const metroHost = metroHostUri ? new URL(`http://${metroHostUri}`).hostname.replace(/^\[|\]$/g, '') : null;
const host = configuredHost || (
  Platform.OS === 'android' && !Device.isDevice
    ? '10.0.2.2'
    : Device.isDevice && metroHost
      ? metroHost
      : '127.0.0.1'
);

export const API_URL = `http://${host}:${PORT}/api`;
