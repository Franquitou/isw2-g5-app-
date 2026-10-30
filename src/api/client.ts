import { getAccessToken } from '@/auth/tokenStorage';
import { apiConfig } from './config';
import { ApiError, toApiError } from './errors';

/** Opciones aceptadas por el cliente HTTP. */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Adjunta el token JWT. Por defecto `true`; usar `false` en endpoints públicos. */
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

let unauthorizedHandler: ((token: string | null) => Promise<void>) | null = null;

/** Permite al módulo de sesión reaccionar a un 401 de una operación protegida. */
export function setUnauthorizedHandler(handler: typeof unauthorizedHandler): void {
  unauthorizedHandler = handler;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed.length === 0) {
    return '';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Ejecuta una solicitud HTTP contra el backend y devuelve el JSON tipado.
 *
 * - Agrega `Authorization: Bearer <token>` cuando `auth` es verdadero y hay token.
 * - Convierte los errores del backend en `ApiError` (contrato uniforme).
 * - Devuelve `undefined` para respuestas 204.
 * - No expone detalles internos de la excepción al usuario.
 *
 * @param path ruta relativa, por ejemplo `/torneos`.
 * @param options método, cuerpo, autenticación, headers y timeout.
 * @returns el cuerpo JSON parseado o `undefined` si no hay contenido.
 * @throws ApiError cuando la respuesta no es exitosa o falla la conexión.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = auth ? await getAccessToken() : null;
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    if (body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiConfig.baseUrl}${normalizePath(path)}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const rawBody = await response.text();
    const parsedBody = rawBody.length > 0 ? parseJson(rawBody) : null;

    if (!response.ok) {
      if (auth && response.status === 401 && unauthorizedHandler) {
        try {
          await unauthorizedHandler(token);
        } catch {
          // La respuesta original 401 debe prevalecer incluso si falla el almacenamiento local.
        }
      }
      throw toApiError(response.status, parsedBody);
    }

    return parsedBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new ApiError(0, 'La solicitud tardó demasiado. Verificá la conexión con el servidor.');
    }
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Verificá la URL de la API y que el backend esté iniciado.',
    );
  } finally {
    clearTimeout(timer);
  }
}

type RequestOptionsWithoutMethod = Omit<ApiRequestOptions, 'method'>;

/** Atajos por método HTTP para evitar repetir `method` en cada llamada. */
export const api = {
  get: <T>(path: string, options: RequestOptionsWithoutMethod = {}) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: RequestOptionsWithoutMethod = {}) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options: RequestOptionsWithoutMethod = {}) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptionsWithoutMethod = {}) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = void>(path: string, options: RequestOptionsWithoutMethod = {}) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
