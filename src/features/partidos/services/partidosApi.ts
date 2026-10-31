import { api } from '@/api';
import type {
  EstadoPartido,
  Evento,
  EventoCreateRequest,
  Partido,
  PartidoDetalle,
  PartidoListado,
  PartidoWriteRequest,
  Posicion,
  Suspendido,
} from '@/types';

/**
 * Escrituras de RF-06 a RF-09 y consultas públicas de RF-10 a RF-12.
 *
 * Las lecturas usan `auth: false` porque el contrato las define como públicas.
 * Las escrituras adjuntan el JWT y el backend valida ADMIN o DELEGADO.
 */
export const partidosApi = {
  /** Listado público de una jornada con resultado derivado. */
  listar: (torneoId: number, numeroFecha: number) =>
    api.get<PartidoListado[]>(`/torneos/${torneoId}/partidos?numeroFecha=${numeroFecha}`, { auth: false }),

  /** Detalle público con resultado y eventos. */
  detalle: (id: number) => api.get<PartidoDetalle>(`/partidos/${id}`, { auth: false }),

  /** Tabla de posiciones pública del torneo. */
  tabla: (torneoId: number) => api.get<Posicion[]>(`/torneos/${torneoId}/tabla`, { auth: false }),

  /** Jugadores suspendidos para una jornada. */
  suspendidos: (torneoId: number, numeroFecha: number) =>
    api.get<Suspendido[]>(`/torneos/${torneoId}/suspendidos?numeroFecha=${numeroFecha}`, { auth: false }),

  /** Programa un partido nuevo (ADMIN). */
  crear: (request: PartidoWriteRequest) => api.post<Partido>('/partidos', request),

  /** Edita un partido PROGRAMADO (ADMIN). */
  editar: (id: number, request: PartidoWriteRequest) => api.put<Partido>(`/partidos/${id}`, request),

  /** Borra un partido PROGRAMADO (ADMIN). */
  eliminar: (id: number) => api.delete(`/partidos/${id}`),

  /** Cambia el estado respetando RN-05 y RN-07 (ADMIN o DELEGADO). */
  cambiarEstado: (id: number, estado: EstadoPartido) =>
    api.patch<Partido>(`/partidos/${id}/estado`, { estado }),

  /** Registra un evento en un partido EN_JUEGO (ADMIN o DELEGADO). */
  crearEvento: (partidoId: number, request: EventoCreateRequest) =>
    api.post<Evento>(`/partidos/${partidoId}/eventos`, request),

  /** Corrige un evento de un partido EN_JUEGO (ADMIN o DELEGADO). */
  eliminarEvento: (partidoId: number, eventoId: number) =>
    api.delete(`/partidos/${partidoId}/eventos/${eventoId}`),
};
