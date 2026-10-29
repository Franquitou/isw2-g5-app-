/**
 * DTOs del catálogo, equipos y jugadores (RF-03, RF-04 y RF-05).
 * Deben coincidir con `docs/API.md`, sección 5, del repositorio backend.
 */

export interface Torneo {
  id: number;
  nombre: string;
  anio: number;
  activo: boolean;
}

export interface Cancha {
  id: number;
  nombre: string;
  direccion: string | null;
  activo: boolean;
}

export interface Arbitro {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  activo: boolean;
}

export interface Equipo {
  id: number;
  torneoId: number;
  nombre: string;
  barrio: string | null;
  activo: boolean;
}

export interface Jugador {
  id: number;
  equipoId: number;
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta: number | null;
  activo: boolean;
}

export interface EquipoCreateRequest {
  nombre: string;
  barrio?: string | null;
}

export interface EquipoUpdateRequest {
  nombre: string;
  barrio?: string | null;
}

export interface JugadorCreateRequest {
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta?: number | null;
}

export interface JugadorUpdateRequest {
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta?: number | null;
}
