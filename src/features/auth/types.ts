import type { Rol } from '@/types';

/** DTOs RF-01, compatibles con `docs/API.md` del backend. */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombreCompleto: string;
  rol: Rol;
}
