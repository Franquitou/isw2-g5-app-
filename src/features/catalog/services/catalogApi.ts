import { api } from '@/api';
import type { Arbitro, Cancha, Equipo, Jugador, Torneo } from '@/types';

/**
 * Consultas del catálogo público (RF-05).
 *
 * Todas usan `auth: false` porque son endpoints públicos: el backend no exige
 * token y no conviene enviarlo a rutas que no lo necesitan.
 */
export const catalogApi = {
  /** Torneos activos. */
  listarTorneos: () => api.get<Torneo[]>('/torneos', { auth: false }),

  /** Canchas activas. */
  listarCanchas: () => api.get<Cancha[]>('/canchas', { auth: false }),

  /** Árbitros activos. */
  listarArbitros: () => api.get<Arbitro[]>('/arbitros', { auth: false }),

  /** Equipos activos de un torneo. */
  listarEquipos: (torneoId: number) =>
    api.get<Equipo[]>(`/torneos/${torneoId}/equipos`, { auth: false }),

  /** Jugadores activos de un equipo. */
  listarJugadores: (equipoId: number) =>
    api.get<Jugador[]>(`/equipos/${equipoId}/jugadores`, { auth: false }),
};
