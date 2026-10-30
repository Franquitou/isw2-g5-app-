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
const SESSION_KEY = 'liga_amateur.session';

/** Datos mínimos de sesión para restaurar la navegación sin guardar contraseñas. */
export interface StoredSession {
  token: string;
  username: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
  expiresAt: number;
}

interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getWebStorage(): WebStorage | null {
  const candidate = (globalThis as { localStorage?: WebStorage }).localStorage;
  return candidate ?? null;
}

async function readValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/** Restaura la sesión persistida; elimina tokens vencidos o datos incompletos. */
export async function getStoredSession(): Promise<StoredSession | null> {
  const token = await readValue(TOKEN_KEY);
  const raw = await readValue(SESSION_KEY);
  if (!token || !raw) {
    if (token || raw) await clearAccessToken();
    return null;
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) throw new Error('Sesión inválida');
    const session = data as Omit<StoredSession, 'token'>;
    if (
      typeof session.username !== 'string' ||
      typeof session.nombreCompleto !== 'string' ||
      (session.rol !== 'ADMIN' && session.rol !== 'DELEGADO') ||
      typeof session.expiresAt !== 'number' ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= Date.now()
    ) {
      throw new Error('Sesión vencida o inválida');
    }
    return { ...session, token };
  } catch {
    await clearAccessToken();
    return null;
  }
}

/** El cliente HTTP usa el token solamente mientras la sesión local siga vigente. */
export async function getAccessToken(): Promise<string | null> {
  return (await getStoredSession())?.token ?? null;
}

/** Mantiene la función existente para el almacenamiento seguro del JWT. */
export async function setAccessToken(token: string): Promise<void> {
  await writeValue(TOKEN_KEY, token);
}

/** Guarda token y perfil de navegación en el almacenamiento de la plataforma. */
export async function saveSession(session: StoredSession): Promise<void> {
  try {
    await setAccessToken(session.token);
    await writeValue(SESSION_KEY, JSON.stringify({
      username: session.username,
      nombreCompleto: session.nombreCompleto,
      rol: session.rol,
      expiresAt: session.expiresAt,
    }));
  } catch (error) {
    await clearAccessToken();
    throw error;
  }
}

/** Cierre de sesión local; no existe endpoint de logout en la especificación. */
export async function clearAccessToken(): Promise<void> {
  await deleteValue(TOKEN_KEY);
  await deleteValue(SESSION_KEY);
}
