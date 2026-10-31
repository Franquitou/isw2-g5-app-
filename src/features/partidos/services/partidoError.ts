import { ApiError } from '@/api';

/**
 * Mensajes de RF-06 a RF-12.
 * El backend sigue siendo la autoridad sobre reglas, permisos y conflictos; en los
 * 409 su mensaje explica la regla concreta (transición, choque de horarios, etc.).
 */
export function partidoError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No se pudo completar la operación.';
  if (error.status === 400 && error.validationErrors.length > 0) {
    return error.validationErrors.map(({ field, message }) => `${field}: ${message}`).join('\n');
  }
  if (error.status === 401) return 'La sesión venció. Iniciá sesión nuevamente.';
  if (error.status === 403) return 'Tu rol no permite realizar esta acción.';
  if (error.status === 404) return error.message;
  if (error.status === 409) return error.message;
  return error.message;
}
