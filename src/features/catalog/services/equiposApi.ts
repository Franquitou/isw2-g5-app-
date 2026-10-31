import { api } from '@/api';
import type {
  Equipo,
  EquipoCreateRequest,
  EquipoUpdateRequest,
  Jugador,
  JugadorCreateRequest,
  JugadorUpdateRequest,
} from '@/types';

/**
 * Escrituras de RF-03 y RF-04.
 *
 * `api` adjunta el JWT almacenado y el backend exige rol ADMIN. Las lecturas
 * siguen en `catalogApi` porque son públicas. La baja es lógica: la API
 * responde 204 y el registro deja de aparecer en los listados.
 */
export const equiposApi = {
  /** Alta de equipo dentro de un torneo; el torneo va en la ruta. */
  crear: (torneoId: number, request: EquipoCreateRequest) =>
    api.post<Equipo>(`/torneos/${torneoId}/equipos`, request),

  /** Edición de equipo; no cambia de torneo. */
  editar: (id: number, request: EquipoUpdateRequest) =>
    api.put<Equipo>(`/equipos/${id}`, request),

  /** Baja lógica del equipo. */
  darDeBaja: (id: number) => api.delete(`/equipos/${id}`),

  /** Alta de jugador dentro de un equipo; el equipo va en la ruta. */
  crearJugador: (equipoId: number, request: JugadorCreateRequest) =>
    api.post<Jugador>(`/equipos/${equipoId}/jugadores`, request),

  /** Edición de jugador; no cambia de equipo. */
  editarJugador: (id: number, request: JugadorUpdateRequest) =>
    api.put<Jugador>(`/jugadores/${id}`, request),

  /** Baja lógica del jugador. */
  darDeBajaJugador: (id: number) => api.delete(`/jugadores/${id}`),
};
