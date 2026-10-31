import type { EstadoPartido, MotivoSuspension, TipoEvento } from '@/types';

/** Etiquetas visibles de los estados. */
export const ETIQUETA_ESTADO: Record<EstadoPartido, string> = {
  PROGRAMADO: 'Programado',
  EN_JUEGO: 'En juego',
  FINALIZADO: 'Finalizado',
  SUSPENDIDO: 'Suspendido',
};

/** Etiquetas visibles de los tipos de evento. */
export const ETIQUETA_EVENTO: Record<TipoEvento, string> = {
  GOL: 'Gol',
  AMARILLA: 'Amarilla',
  ROJA: 'Roja',
};

/** Etiquetas visibles de los motivos de suspensión. */
export const ETIQUETA_MOTIVO: Record<MotivoSuspension, string> = {
  ROJA: 'Roja directa',
  DOBLE_AMARILLA: 'Doble amarilla',
};

export interface Transicion {
  estado: EstadoPartido;
  etiqueta: string;
  /** Texto de confirmación; `null` cuando no hace falta confirmar. */
  confirmacion: string | null;
}

/** Transiciones permitidas por RN-05 desde cada estado. */
export const TRANSICIONES: Record<EstadoPartido, Transicion[]> = {
  PROGRAMADO: [
    { estado: 'EN_JUEGO', etiqueta: 'Iniciar partido', confirmacion: null },
    {
      estado: 'SUSPENDIDO',
      etiqueta: 'Suspender partido',
      confirmacion: 'El partido quedará suspendido y no se podrá reprogramar desde la app.',
    },
  ],
  EN_JUEGO: [
    {
      estado: 'FINALIZADO',
      etiqueta: 'Finalizar partido',
      confirmacion: 'El resultado quedará cerrado y sumará a la tabla de posiciones.',
    },
    {
      estado: 'SUSPENDIDO',
      etiqueta: 'Suspender partido',
      confirmacion: 'El partido quedará suspendido y no sumará a la tabla.',
    },
  ],
  FINALIZADO: [],
  SUSPENDIDO: [],
};

/**
 * Formatea un instante ISO del backend sin depender de `Intl`.
 * Espera `2026-11-07T18:00:00-03:00` y devuelve `07/11/2026 18:00`.
 */
export function formatearFechaHora(iso: string): string {
  const fecha = iso.slice(0, 10);
  const hora = iso.slice(11, 16);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) return iso;
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio} ${hora}`;
}

/** Separa un instante ISO en fecha y hora para el formulario. */
export function separarFechaHora(iso: string): { fecha: string; hora: string } {
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

/**
 * Valida y arma el instante que espera el backend: fecha `AAAA-MM-DD`, hora `HH:mm`
 * y offset fijo de la liga (`-03:00`).
 */
export function armarFechaHora(fecha: string, hora: string): string | null {
  const fechaLimpia = fecha.trim();
  const horaLimpia = hora.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia) || !/^\d{2}:\d{2}$/.test(horaLimpia)) return null;
  const [anio, mes, dia] = fechaLimpia.split('-').map(Number);
  const [horas, minutos] = horaLimpia.split(':').map(Number);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || horas > 23 || minutos > 59) return null;
  const verificacion = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    verificacion.getUTCFullYear() !== anio ||
    verificacion.getUTCMonth() !== mes - 1 ||
    verificacion.getUTCDate() !== dia
  ) {
    return null;
  }
  return `${fechaLimpia}T${horaLimpia}:00-03:00`;
}

/** Fecha local de hoy en formato `AAAA-MM-DD`, para precargar el formulario. */
export function fechaDeHoy(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
