import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Almacenamiento del token JWT.
 *
 * En Android/iOS se usa `expo-secure-store` (almacenamiento cifrado del sistema).
 * En web se usa `localStorage` porque SecureStore no está disponible; esto es
 * aceptable para desarrollo, pero no debe considerarse equivalente en seguridad.
 *
 * El módulo de autenticación (integrante A) es el encargado de guardar y borrar
 * el token después del login y del logout.
 */

const TOKEN_KEY = 'liga_amateur.access_token';

interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getWebStorage(): WebStorage | null {
  const candidate = (globalThis as { localStorage?: WebStorage }).localStorage;
  return candidate ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(TOKEN_KEY) ?? null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
