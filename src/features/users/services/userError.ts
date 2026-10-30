import { ApiError } from '@/api';

/** Mensajes de RF-02; el backend sigue resolviendo las reglas y los permisos. */
export function userError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No se pudo completar la operación.';
  if (error.status === 400 && error.validationErrors.length > 0) {
    return error.validationErrors.map(({ field, message }) => `${field}: ${message}`).join('\n');
  }
  if (error.status === 401) return 'La sesión venció. Iniciá sesión nuevamente.';
  if (error.status === 403) return 'No tenés permisos para administrar usuarios.';
  if (error.status === 404) return 'El usuario solicitado no existe.';
  if (error.status === 409) return 'El usuario o su estado actual impiden esta operación.';
  return error.message;
}
