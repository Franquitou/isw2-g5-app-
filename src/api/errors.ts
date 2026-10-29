import type { ApiErrorResponse, ApiValidationError } from '@/types/api';

/**
 * Error normalizado de la API.
 *
 * `status = 0` representa un problema de red o un tiempo de espera agotado,
 * no una respuesta HTTP del servidor.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly validationErrors: ApiValidationError[];
  readonly path: string | null;

  constructor(
    status: number,
    message: string,
    validationErrors: ApiValidationError[] = [],
    path: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
    this.path = path;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos.',
  401: 'Tenés que iniciar sesión para continuar.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'La operación entra en conflicto con los datos actuales.',
  415: 'El formato de los datos enviados no es admitido.',
  500: 'Ocurrió un error en el servidor.',
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ApiErrorResponse>;
  return typeof candidate.message === 'string' && typeof candidate.status === 'number';
}

/**
 * Convierte una respuesta de error del backend en `ApiError`.
 * Si el cuerpo no respeta el contrato común, usa un mensaje seguro por código.
 */
export function toApiError(status: number, body: unknown): ApiError {
  if (isApiErrorResponse(body)) {
    return new ApiError(status, body.message, body.validationErrors ?? [], body.path ?? null);
  }
  return new ApiError(status, DEFAULT_MESSAGES[status] ?? 'No se pudo completar la solicitud.');
}
