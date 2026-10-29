import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/api';

interface EstadoLista<T> {
  datos: T[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'No se pudo cargar la información.';
}

/**
 * Carga una lista del catálogo y expone estados de carga, error y recarga.
 *
 * `cargar` debe ser una función estable (por ejemplo, un método de `catalogApi`),
 * porque se usa como dependencia del efecto.
 *
 * @param cargar función que devuelve la lista a mostrar
 * @returns datos, estado de carga, mensaje de error y acción de recarga
 */
export function useListaCatalogo<T>(cargar: () => Promise<T[]>): EstadoLista<T> {
  const [datos, setDatos] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await cargar();
      if (montado.current) {
        setDatos(respuesta);
      }
    } catch (fallo) {
      if (montado.current) {
        setError(mensajeDeError(fallo));
      }
    } finally {
      if (montado.current) {
        setCargando(false);
      }
    }
  }, [cargar]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar };
}
