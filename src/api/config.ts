/**
 * Configuración de la API.
 *
 * `EXPO_PUBLIC_API_URL` se define en `.env` (ver `.env.example`). Expo incorpora
 * las variables que empiezan con `EXPO_PUBLIC_` en tiempo de compilación.
 *
 * En un teléfono físico `localhost` apunta al teléfono, no a la computadora:
 * usar la IP LAN de la máquina donde corre Spring Boot.
 */

const FALLBACK_API_URL = 'http://localhost:8080/api';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const apiConfig = {
  baseUrl: (configuredUrl && configuredUrl.length > 0 ? configuredUrl : FALLBACK_API_URL).replace(/\/+$/, ''),
  usingFallbackUrl: !configuredUrl,
} as const;

export const appConfig = {
  environment: process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'development',
} as const;
