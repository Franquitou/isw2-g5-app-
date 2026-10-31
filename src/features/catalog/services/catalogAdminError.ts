import { ApiError } from '@/api';

/**
 * Mensajes de RF-03 y RF-04.
 * El backend sigue siendo la autoridad sobre reglas, permisos y conflictos.
 */
export function catalogAdminError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No se pudo completar la operación.';
  if (error.status === 400 && error.validationErrors.length > 0) {
    return error.validationErrors.map(({ field, message }) => `${field}: ${message}`).join('\n');
  }
  if (error.status === 401) return 'La sesión venció. Iniciá sesión nuevamente.';
  if (error.status === 403) return 'Solo un administrador puede modificar equipos y jugadores.';
  if (error.status === 404) return 'El torneo, equipo o jugador indicado no existe.';
  if (error.status === 409) return error.message;
  return error.message;
}
