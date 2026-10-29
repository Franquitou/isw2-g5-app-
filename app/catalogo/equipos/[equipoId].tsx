import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { AppScreen } from '@/components';
import {
  EncabezadoCatalogo,
  ItemCatalogo,
  ListaCatalogo,
  catalogApi,
  useListaCatalogo,
} from '@/features/catalog';

/**
 * Jugadores activos de un equipo (RF-05).
 * El DNI se muestra porque el catálogo público lo expone en el contrato.
 */
export default function JugadoresDeEquipoScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>();
  const id = Number(equipoId);
  const cargar = useCallback(() => catalogApi.listarJugadores(id), [id]);
  const { datos, cargando, error, recargar } = useListaCatalogo(cargar);

  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Jugadores"
        descripcion="Plantel activo del equipo, ordenado por apellido."
      />

      <ListaCatalogo
        datos={datos}
        cargando={cargando}
        error={error}
        mensajeVacio="Este equipo todavía no tiene jugadores activos."
        recargar={recargar}
        renderItem={(jugador) => (
          <ItemCatalogo
            key={jugador.id}
            titulo={`${jugador.apellido}, ${jugador.nombre}`}
            detalle={`DNI ${jugador.dni}`}
            extra={jugador.numeroCamiseta ? `Camiseta ${jugador.numeroCamiseta}` : null}
          />
        )}
      />
    </AppScreen>
  );
}
