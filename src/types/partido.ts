/**
 * DTOs de partidos, eventos, tabla y suspendidos (RF-06 a RF-12).
 * Deben coincidir con `docs/API.md`, secciones 6 y 7, del repositorio backend.
 */

export type EstadoPartido = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';

export type TipoEvento = 'GOL' | 'AMARILLA' | 'ROJA';

export type MotivoSuspension = 'ROJA' | 'DOBLE_AMARILLA';

export interface Marcador {
  golesLocal: number;
  golesVisitante: number;
}

/** Partido tal como lo devuelven las escrituras y el cambio de estado. */
export interface Partido {
  id: number;
  torneoId: number;
  numeroFecha: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  canchaId: number;
  arbitroId: number;
  fechaHoraInicio: string;
  estado: EstadoPartido;
}

/** Fila del listado público por jornada (RF-10). */
export interface PartidoListado extends Partido {
  resultado: Marcador;
}

export interface Evento {
  id: number;
  partidoId: number;
  jugadorId: number;
  tipo: TipoEvento;
  minuto: number;
}

/** Detalle público de un partido (RF-10). */
export interface PartidoDetalle extends Partido {
  resultado: Marcador;
  eventos: Evento[];
}

export interface PartidoWriteRequest {
  torneoId: number;
  numeroFecha: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  canchaId: number;
  arbitroId: number;
  /** ISO-8601 con offset, por ejemplo `2026-11-07T18:00:00-03:00`. */
  fechaHoraInicio: string;
}

export interface EventoCreateRequest {
  jugadorId: number;
  tipo: TipoEvento;
  minuto: number;
}

/** Fila de la tabla de posiciones (RF-11). */
export interface Posicion {
  equipoId: number;
  equipo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

/** Jugador suspendido para una jornada (RF-12). */
export interface Suspendido {
  jugadorId: number;
  equipoId: number;
  numeroFecha: number;
  motivo: MotivoSuspension;
  numeroFechaSancion: number;
}
