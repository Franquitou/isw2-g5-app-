import type { Rol } from '@/types';

/** Contrato RF-02 de `backend/docs/API.md` §4; nunca contiene hashes. */
export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
  activo: boolean;
  fechaAlta: string;
}

export interface UsuarioCreateRequest {
  username: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
}

export interface UsuarioUpdateRequest {
  nombreCompleto: string;
  rol: Rol;
}
