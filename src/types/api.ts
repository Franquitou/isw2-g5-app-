/**
 * Tipos compartidos por todos los módulos para el contrato HTTP del backend.
 * Reflejan el formato uniforme de error definido en `docs/API.md` del repositorio backend.
 */

export type Rol = 'ADMIN' | 'DELEGADO';

/** Error de validación individual devuelto por el backend. */
export interface ApiValidationError {
  field: string;
  message: string;
}

/** Cuerpo JSON uniforme de error. */
export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string | null;
  validationErrors: ApiValidationError[];
}
