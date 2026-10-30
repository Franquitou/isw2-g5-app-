import { api } from '@/api';
import type { Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from '../types';

/** Seis operaciones ADMIN de RF-02. `api` adjunta el JWT almacenado por defecto. */
export const usersApi = {
  listar: (activo?: boolean) => api.get<Usuario[]>(`/usuarios${activo === undefined ? '' : `?activo=${activo}`}`),
  consultar: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  crear: (request: UsuarioCreateRequest) => api.post<Usuario>('/usuarios', request),
  editar: (id: number, request: UsuarioUpdateRequest) => api.put<Usuario>(`/usuarios/${id}`, request),
  cambiarPassword: (id: number, password: string) => api.patch<Usuario>(`/usuarios/${id}/password`, { password }),
  cambiarEstado: (id: number, activo: boolean) => api.patch<Usuario>(`/usuarios/${id}/estado`, { activo }),
};
